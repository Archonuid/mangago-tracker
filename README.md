# 📚 Mangago Reading List Tracker
A Chrome extension that automatically syncs your Mangago reading list actions  
(**Want to Read, Reading, Already Read**) to a Google Sheet. Never lose your reading lists again.

## ❓ Why Mangago Tracker?
Manga sites go down. When they do, reading lists often disappear with them.

Recent Mangago blackouts and the ongoing takedowns of manga sites (like bato.to), along with instability in reader apps such as Mihon or Tachiyomi, make platform-based reading lists unreliable.

Mangago Tracker saves your reading list directly to your own Google Sheet, under your Google account, so you never lose it — even if a site goes offline or shuts down.

---

Step 1: Enter Spreadsheet ID.
<img width="1918" height="1140" alt="Image" src="https://github.com/user-attachments/assets/1e9a40e7-03b0-4f42-8ccb-5b22d5a58802" />
Step 2: After entering spreadsheet ID, click Save Settings.
<img width="1918" height="1087" alt="Image" src="https://github.com/user-attachments/assets/174dc6eb-f861-44f5-b7ff-ca02b1bc4d79" />
Step 3: Click on test connection.
<img width="1918" height="1087" alt="Image" src="https://github.com/user-attachments/assets/909ef1cd-2416-46c5-80a6-8cdbba6aa341" />
Step 4: Go to any manga on mangago and add it to your 'Want to Read', 'Reading' or 'Already Read' list and you will see that manga in your Spreadsheet.
<img width="1918" height="820" alt="Image" src="https://github.com/user-attachments/assets/0792a3e8-4d31-4dc5-ada2-838b4dab4ec3" />

## ✨ Features
- Sync Mangago reading list actions to Google Sheets
- No duplicate entries
- Automatically updates reading status
- Secure Google OAuth authentication
- No ads, no analytics, no tracking
- All data stays in **your own Google Sheet**

---

# Project Structure
<pre>
mangago-tracker/
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── manifest.json
├── background.js
├── content.js
├── popup.html
├── popup.js
├── help.html / help.js
├── docs/            (project website and privacy policy)
└── README.md
</pre>

### File overview
- **manifest.json**  
  Chrome extension configuration (permissions, OAuth, scripts)

- **background.js**  
  Handles Google OAuth and communication with Google Sheets API

- **content.js**  
  Detects user actions on Mangago pages and sends manga data to the background script

- **popup.html / popup.js**  
  Extension UI for entering Spreadsheet ID and testing connection

- **help.html / help.js**  
  Setup Guide and Troubleshooting page, opened from the popup

- **icons/**  
  Extension icons used by Chrome

---

## 🚀 How It Works
1. You connect the extension to a Google Sheet using OAuth
2. The extension runs on `https://www.mangago.me/*`
3. When you click:
   - **Want to Read**
   - **Reading**
   - **Already Read**
4. The extension:
   - Reads the manga title and page URL
   - Finds or creates a row in your Google Sheet
   - Updates the status automatically

---

## 🧩 Installation
No Google Cloud setup needed. You only need Google Chrome (or another Chromium browser) and a Google account.

1. On this page, click **Code → Download ZIP** and unzip it
2. Open Chrome and go to: `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked**
5. Select the unzipped folder

The extension ID shown in `chrome://extensions` should be `gpojgbkdeecfajdfnjllinahgaphpmki`. If it's different, you have an old copy: remove it and download again.

When you sign in, Google may show **"Google hasn't verified this app"**. Click **Advanced → Go to Mangago Reading List Tracker** to continue. The extension can only access Google Sheets.

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

Full policy: https://archonuid.github.io/mangago-tracker/privacy.html

---

## ⚠️ Notes
Works best in Google Chrome. Brave and other Chromium browsers may require additional OAuth permissions. Google API quotas apply (free tier is sufficient for normal usage).

---

## 🤝 Contributing
Pull requests and issues are welcome. Feel free to fork and adapt this project for your own needs.

---

## 🛠 Maintainer notes
- The `key` in `manifest.json` gives every install the same extension ID. The shared OAuth client (Google Cloud → Google Auth Platform → Clients) is a **Chrome Extension** client with Item ID `gpojgbkdeecfajdfnjllinahgaphpmki`. Don't remove the key, or sign-in breaks for everyone.
- `key.pem` is the private half of that key. It is gitignored; keep a backup.
- If you fork this and use your own OAuth client, replace `oauth2.client_id` in `manifest.json` and remove `key` (or generate your own).
