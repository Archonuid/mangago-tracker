// Help page script for Mangago Reading List Tracker

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('extensionId').textContent = chrome.runtime.id;
  document.getElementById('version').textContent = chrome.runtime.getManifest().version;
});
