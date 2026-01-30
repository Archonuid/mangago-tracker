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
async function getAuthToken() {
  if (authToken) return authToken;

  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, token => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        authToken = token;
        resolve(authToken);
      }
    });
  });
}

// Test connection
async function testConnection() {
  await loadSettings();

  if (!spreadsheetId) {
    throw new Error('Spreadsheet ID not configured');
  }

  await getAuthToken();

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }
  );

  if (!response.ok) {
    if (response.status === 404) throw new Error('Spreadsheet not found');
    if (response.status === 403) throw new Error('Permission denied');
    throw new Error(`Sheets API error: ${response.statusText}`);
  }

  const data = await response.json();
  return { success: true, title: data.properties.title };
}

// Handle sheet updates
async function handleSheetUpdate(mangaData) {
  await loadSettings();

  if (!spreadsheetId) {
    throw new Error('Spreadsheet ID not configured');
  }

  await getAuthToken();

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
