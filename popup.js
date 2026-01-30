// Popup script for Mangago Reading List Tracker

document.addEventListener('DOMContentLoaded', async () => {
  const spreadsheetIdInput = document.getElementById('spreadsheetId');
  const saveBtn = document.getElementById('saveBtn');
  const testBtn = document.getElementById('testBtn');
  const statusEl = document.getElementById('status');
  const statusText = document.getElementById('statusText');
  const loadingEl = document.getElementById('loading');

  loadSettings();

  saveBtn.addEventListener('click', saveSettings);
  testBtn.addEventListener('click', testConnection);

  async function loadSettings() {
    const result = await chrome.storage.sync.get(['spreadsheetId']);
    if (result.spreadsheetId) {
      spreadsheetIdInput.value = result.spreadsheetId;
      updateStatus('connected', 'Settings loaded');
    } else {
      updateStatus('', 'Not configured');
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
    updateStatus('connected', 'Settings saved');
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
    saveBtn.disabled = show;
    testBtn.disabled = show;
  }
});

  