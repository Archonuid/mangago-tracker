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

```mangago-tracker/```
```├── icons/```
```│   ├── icon16.png```
```│   ├── icon48.png```
```│   └── icon128.png```
```├── manifest.json```
```├── background.js```
```├── content.js```
```├── popup.html```
```├── popup.js```
```└── README.md```

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

## 🚀 How It Works

1. You connect the extension to a Google Sheet using OAuth
2. The extension runs on `https://www.mangago.me/*`
3. When you click:
   - **Want to Read**
   - **Reading**
   - **Completed**
4. The extension:
   - Reads the manga title and page URL
   - Finds or creates a row in your Google Sheet
   - Updates the status automatically

---
# To run it on your own device

## 🧩 Installation (Unpacked Extension)

1. Clone or download this repository
2. Open Chrome and go to: `chrome://extensions`
3. 3. Enable **Developer mode**
4. Click **Load unpacked**
5. Select the project folder

---

## 🔐 Google OAuth Setup (Required)

Because this extension is not bundled with a shared OAuth client, **each user must create their own Google OAuth credentials**.

### Step 1: Create a Google Cloud Project

1. Go to https://console.cloud.google.com
2. Click **New Project**
3. Name it anything (e.g. `Mangago Tracker`)
4. Create the project

---

### Step 2: Enable Google Sheets API

1. Go to **APIs & Services → Library**
2. Search for **Google Sheets API**
3. Click **Enable**

---

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services → OAuth consent screen**
2. Select **External**
3. Fill in:
- App name: Mangago Tracker
- User support email: your email
- Developer contact email: your email
4. Save and continue (no scopes needed)
5. Add yourself as a test user

---

### Step 4: Load the Extension to Get Extension ID

1. Open: `chrome://extensions`
2. Enable **Developer mode**
3. Load the extension folder
4. Copy the **Extension ID** shown under the extension name

---

### Step 5: Create OAuth Client ID

1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials → OAuth Client ID**
3. Application type: **Chrome Extension**
4. Paste the **Extension ID**
5. Create and copy the **Client ID**

---

### Step 6: Update `manifest.json`

Open `manifest.json` and replace: `"client_id": "PASTE_YOUR_CLIENT_ID_HERE.apps.googleusercontent.com" ` with your actual Client ID.

Save the file and reload the extension in `chrome://extensions`.

---

## 📄 Google Sheets Setup

1. Create a new Google Sheet
2. Copy the Spreadsheet ID from the URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
3. Open the extension popup
4. Paste the Spreadsheet ID
5. Click Save Settings
6. Click Test Connection
7. Approve Google OAuth

The extension will automatically create headers if the sheet is empty.

---

## 🧪 Usage

1. Open a manga page on Mangago
2. Click Want to Read, Reading, or Completed
3. Check your Google Sheet — the entry will appear or update automatically

---

## 🔒 Privacy

1. No personal data is collected
2. No analytics or ads
3. No data is sent anywhere except Google Sheets
4. All access is explicitly authorized by the user

---

## ⚠️ Notes

Works best in Google Chrome. Brave and other Chromium browsers may require additional OAuth permissions. Google API quotas apply (free tier is sufficient for normal usage).

---

## 🤝 Contributing

Pull requests and issues are welcome. Feel free to fork and adapt this project for your own needs.
