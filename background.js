// Background service worker for Mangago Reading List Tracker

let authToken = null;
let spreadsheetId = null;

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Mangago Tracker] Extension installed');
  loadSettings();
});

// Load saved settings
async function loadSettings() {
  const result = await chrome.storage.sync.get(['spreadsheetId']);
  spreadsheetId = result.spreadsheetId || null;
}

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'testConnection') {
    testConnection()
      .then(result => sendResponse(result))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (request.action === 'createSheet') {
    createSheet()
      .then(result => sendResponse(result))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (request.action === 'findSheets') {
    findSheets(request.interactive)
      .then(result => sendResponse(result))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (request.action === 'reloadSettings') {
    loadSettings();
  }

  if (request.action === 'updateSheet') {
    handleSheetUpdate(request.data)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// OAuth token (single source of truth)
async function getAuthToken(interactive = true) {
  if (authToken) return authToken;

  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, token => {
      if (chrome.runtime.lastError) {
        reject(new Error(describeAuthError(chrome.runtime.lastError.message)));
      } else {
        authToken = token;
        resolve(authToken);
      }
    });
  });
}

// Drop a cached token that Google rejected so the next call fetches a fresh one
async function clearAuthToken() {
  if (!authToken) return;
  await new Promise(resolve => chrome.identity.removeCachedAuthToken({ token: authToken }, resolve));
  authToken = null;
}

// Turn Chrome's raw OAuth errors into something a user can act on
function describeAuthError(message) {
  if (/bad client id/i.test(message)) {
    return `Google rejected this extension's sign-in (extension ID ${chrome.runtime.id} isn't registered). ` +
      'Reinstall the latest version of the extension, then see Troubleshooting.';
  }
  if (/did not approve|user.*cancel/i.test(message)) {
    return 'Google sign-in was cancelled. Try again and approve access.';
  }
  return message;
}

// Test connection
async function testConnection() {
  await loadSettings();

  if (!spreadsheetId) {
    throw new Error('Spreadsheet ID not configured');
  }

  const fetchSheet = async () => {
    await getAuthToken();
    return fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
  };

  let response = await fetchSheet();

  // Expired or revoked token: clear it and retry once
  if (response.status === 401) {
    await clearAuthToken();
    response = await fetchSheet();
  }

  if (!response.ok) {
    // With the drive.file scope, sheets the extension didn't create look missing
    if (response.status === 404 || response.status === 403) {
      throw new Error('Can\'t open this sheet. The extension can only use sheets it created. Click "Set up my tracking sheet" to make one.');
    }
    throw new Error(`Sheets API error: ${response.statusText}`);
  }

  const data = await response.json();
  return { success: true, title: data.properties.title };
}

// List spreadsheets this extension created earlier (drive.file only exposes those).
// Non-interactive calls report signedIn: false instead of opening a sign-in window.
async function findSheets(interactive = true) {
  try {
    await getAuthToken(interactive);
  } catch (err) {
    if (!interactive) return { success: true, signedIn: false, sheets: [] };
    throw err;
  }

  const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
  const listFiles = () => fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=modifiedTime desc&pageSize=10&fields=files(id,name,modifiedTime)`,
    { headers: { Authorization: `Bearer ${authToken}` } }
  );

  let response = await listFiles();

  if (response.status === 401) {
    await clearAuthToken();
    await getAuthToken(interactive);
    response = await listFiles();
  }

  if (!response.ok) {
    throw new Error(`Couldn't look for your sheets: ${response.statusText || response.status}`);
  }

  const data = await response.json();
  return { success: true, signedIn: true, sheets: data.files || [] };
}

// Create a new tracking sheet in the user's Drive and remember it
async function createSheet() {
  const postSheet = async () => {
    await getAuthToken();
    return fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: { title: 'Mangago Reading List' },
        sheets: [{
          properties: { title: 'Sheet1', gridProperties: { frozenRowCount: 1 } },
          data: [{
            startRow: 0,
            startColumn: 0,
            rowData: [{
              values: ['Manga Title', 'Status', 'Last Chapter', 'URL'].map(text => ({
                userEnteredValue: { stringValue: text },
                userEnteredFormat: { textFormat: { bold: true } }
              }))
            }]
          }]
        }]
      })
    });
  };

  let response = await postSheet();

  if (response.status === 401) {
    await clearAuthToken();
    response = await postSheet();
  }

  if (!response.ok) {
    throw new Error(`Couldn't create the sheet: ${response.statusText || response.status}`);
  }

  const data = await response.json();
  spreadsheetId = data.spreadsheetId;
  await chrome.storage.sync.set({ spreadsheetId });

  return { success: true, spreadsheetId, title: data.properties.title, url: data.spreadsheetUrl };
}

// Handle sheet updates
async function handleSheetUpdate(mangaData) {
  await loadSettings();

  if (!spreadsheetId) {
    throw new Error('Spreadsheet ID not configured');
  }

  await getAuthToken();

  // Service workers can keep a stale token around; validate it before writing
  const check = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=spreadsheetId`,
    { headers: { Authorization: `Bearer ${authToken}` } }
  );
  if (check.status === 401) {
    await clearAuthToken();
    await getAuthToken();
  }

  const existingRow = await findMangaRow(mangaData.title);

  if (existingRow) {
    await updateMangaRow(existingRow, mangaData);
  } else {
    await addMangaRow(mangaData);
  }

  return { success: true };
}

// Find manga row
async function findMangaRow(title) {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A:A`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }
  );

  if (!response.ok) return null;

  const data = await response.json();
  const values = data.values || [];

  const normalize = s => s.toLowerCase().replace(/\s+/g, ' ').trim();

  for (let i = 0; i < values.length; i++) {
    if (values[i][0] && normalize(values[i][0]) === normalize(title)) {
      return i + 1;
    }
  }

  return null;
}

// Update existing row
async function updateMangaRow(rowIndex, mangaData) {
  const range = `Sheet1!A${rowIndex}:D${rowIndex}`;

  const values = [[
    mangaData.title,
    mangaData.status,
    mangaData.lastChapter,
    mangaData.url
  ]];

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=RAW`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values })
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update row: ${response.statusText}`);
  }
}

// Add new row
async function addMangaRow(mangaData) {
  await ensureHeaders();

  const values = [[
    mangaData.title,
    mangaData.status,
    mangaData.lastChapter,
    mangaData.url
  ]];

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A:D:append?valueInputOption=RAW`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values })
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to add row: ${response.statusText}`);
  }
}

// Ensure headers exist
async function ensureHeaders() {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:D1`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }
  );

  const data = await response.json();

  if (!data.values || data.values.length === 0) {
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:D1?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: [['Manga Title', 'Status', 'Last Chapter', 'URL']]
        })
      }
    );
  }
}
