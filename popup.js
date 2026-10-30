// Popup script for Mangago Reading List Tracker

document.addEventListener('DOMContentLoaded', async () => {
  const spreadsheetIdInput = document.getElementById('spreadsheetId');
  const setupBtn = document.getElementById('setupBtn');
  const createBtn = document.getElementById('createBtn');
  const saveBtn = document.getElementById('saveBtn');
  const testBtn = document.getElementById('testBtn');
  const noSheetEl = document.getElementById('noSheet');
  const chooseSheetEl = document.getElementById('chooseSheet');
  const sheetList = document.getElementById('sheetList');
  const hasSheetEl = document.getElementById('hasSheet');
  const openSheetLink = document.getElementById('openSheetLink');
  const statusEl = document.getElementById('status');
  const statusText = document.getElementById('statusText');
  const loadingEl = document.getElementById('loading');

  loadSettings();

  setupBtn.addEventListener('click', () => setup(true));
  createBtn.addEventListener('click', createSheet);
  saveBtn.addEventListener('click', saveSettings);
  testBtn.addEventListener('click', testConnection);
  document.getElementById('setupLink').addEventListener('click', e => openHelp(e, 'setup'));
  document.getElementById('troubleshootLink').addEventListener('click', e => openHelp(e, 'troubleshooting'));

  function openHelp(event, section) {
    event.preventDefault();
    chrome.tabs.create({ url: chrome.runtime.getURL(`help.html#${section}`) });
  }

  async function loadSettings() {
    const result = await chrome.storage.sync.get(['spreadsheetId']);
    showSheet(result.spreadsheetId);
    if (result.spreadsheetId) {
      updateStatus('connected', 'Sheet linked. Syncing is on.');
    } else {
      updateStatus('', 'No sheet yet. Set one up to start syncing.');
      // If Google access was already granted (e.g. after a reinstall), offer old sheets right away
      setup(false);
    }
  }

  // Toggle between the "set up" and "linked" views
  function showSheet(spreadsheetId) {
    spreadsheetIdInput.value = spreadsheetId || '';
    noSheetEl.hidden = !!spreadsheetId;
    chooseSheetEl.hidden = true;
    hasSheetEl.hidden = !spreadsheetId;
    if (spreadsheetId) {
      openSheetLink.href = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
    }
  }

  // Look for sheets made earlier; offer them, or create one if there are none
  async function setup(interactive) {
    if (interactive) showLoading(true);

    try {
      const response = await chrome.runtime.sendMessage({ action: 'findSheets', interactive });

      if (interactive) showLoading(false);

      if (!response.success) {
        if (interactive) updateStatus('error', response.error);
        return;
      }
      if (!response.signedIn) return;

      if (response.sheets.length > 0) {
        showChoices(response.sheets);
      } else if (interactive) {
        createSheet();
      }
    } catch (err) {
      if (interactive) {
        showLoading(false);
        updateStatus('error', err.message);
      }
    }
  }

  function showChoices(sheets) {
    sheetList.replaceChildren(...sheets.map(sheet => {
      const button = document.createElement('button');
      button.textContent = sheet.name;
      const date = document.createElement('small');
      date.textContent = `Last changed ${new Date(sheet.modifiedTime).toLocaleDateString()}`;
      button.append(date);
      button.addEventListener('click', () => useSheet(sheet.id));

      const item = document.createElement('li');
      item.append(button);
      return item;
    }));

    noSheetEl.hidden = true;
    chooseSheetEl.hidden = false;
    updateStatus('', 'Pick a sheet to keep using, or create a new one.');
  }

  async function useSheet(spreadsheetId) {
    await chrome.storage.sync.set({ spreadsheetId });
    chrome.runtime.sendMessage({ action: 'reloadSettings' });
    showSheet(spreadsheetId);
    testConnection();
  }

  async function createSheet() {
    showLoading(true);

    try {
      const response = await chrome.runtime.sendMessage({ action: 'createSheet' });

      showLoading(false);

      if (response.success) {
        showSheet(response.spreadsheetId);
        updateStatus('connected', `✓ Created "${response.title}". Syncing is on.`);
      } else {
        updateStatus('error', response.error);
      }
    } catch (err) {
      showLoading(false);
      updateStatus('error', err.message);
    }
  }

  async function saveSettings() {
    const spreadsheetId = spreadsheetIdInput.value.trim();
    if (!spreadsheetId) {
      updateStatus('error', 'Please enter a Spreadsheet ID');
      return;
    }

    useSheet(spreadsheetId);
  }

  async function testConnection() {
    showLoading(true);

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'testConnection'
      });

      showLoading(false);

      if (response.success) {
        updateStatus('connected', `✓ Connected to: "${response.title}"`);
      } else {
        updateStatus('error', response.error);
      }
    } catch (err) {
      showLoading(false);
      updateStatus('error', err.message);
    }
  }

  function updateStatus(type, message) {
    statusEl.className = 'status ' + type;
    statusText.textContent = message;
  }

  function showLoading(show) {
    loadingEl.style.display = show ? 'block' : 'none';
    setupBtn.disabled = show;
    createBtn.disabled = show;
    saveBtn.disabled = show;
    testBtn.disabled = show;
  }
});
