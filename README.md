# 📚 Mangago Reading List Tracker

A Chrome extension that automatically syncs your Mangago reading list actions  
(**Want to Read, Reading, Completed**) to a Google Sheet.

This project is open-source and can be used by anyone by setting up their own
Google OAuth credentials.

## ✨ Features

- Sync Mangago reading list actions to Google Sheets
- No duplicate entries
- Automatically updates reading status
- Secure Google OAuth authentication
- No ads, no analytics, no tracking
- All data stays in **your own Google Sheet**

---

# Project Structure
mangago-tracker/
├── icons/
│ ├── icon16.png
│ ├── icon48.png
│ └── icon128.png
├── manifest.json
├── background.js
├── content.js
├── popup.html
├── popup.js
└── README.md

### File overview

- **manifest.json**  
  Chrome extension configuration (permissions, OAuth, scripts)

- **background.js**  
  Handles Google OAuth and communication with Google Sheets API

- **content.js**  
  Detects user actions on Mangago pages and sends manga data to the background script

- **popup.html / popup.js**  
  Extension UI for entering Spreadsheet ID and testing connection

- **icons/**  
  Extension icons used by Chrome

---
