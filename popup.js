// Popup script for Mangago Reading List Tracker

document.addEventListener('DOMContentLoaded', async () => {
  const spreadsheetIdInput = document.getElementById('spreadsheetId');
  const createBtn = document.getElementById('createBtn');
  const saveBtn = document.getElementById('saveBtn');
  const testBtn = document.getElementById('testBtn');
  const noSheetEl = document.getElementById('noSheet');
  const hasSheetEl = document.getElementById('hasSheet');
  const openSheetLink = document.getElementById('openSheetLink');
  const statusEl = document.getElementById('status');
  const statusText = document.getElementById('statusText');
  const loadingEl = document.getElementById('loading');

  loadSettings();

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
      updateStatus('', 'No sheet yet. Create one to start syncing.');
    }
  }

  // Toggle between the "create" and "linked" views
  function showSheet(spreadsheetId) {
    spreadsheetIdInput.value = spreadsheetId || '';
    noSheetEl.hidden = !!spreadsheetId;
    hasSheetEl.hidden = !spreadsheetId;
    if (spreadsheetId) {
      openSheetLink.href = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
    }
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

    await chrome.storage.sync.set({ spreadsheetId });
    chrome.runtime.sendMessage({ action: 'reloadSettings' });
    showSheet(spreadsheetId);
    testConnection();
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
    createBtn.disabled = show;
    saveBtn.disabled = show;
    testBtn.disabled = show;
  }
});
