# 📚 Mangago Reading List Tracker
A Chrome extension that automatically syncs your Mangago reading list actions  
(**Want to Read, Reading, Already Read**) to a Google Sheet. Never lose your reading lists again.

## ❓ Why Mangago Tracker?
Manga sites go down. When they do, reading lists often disappear with them.

Recent Mangago blackouts and the ongoing takedowns of manga sites (like bato.to), along with instability in reader apps such as Mihon or Tachiyomi, make platform-based reading lists unreliable.

Mangago Tracker saves your reading list directly to your own Google Sheet, under your Google account, so you never lose it — even if a site goes offline or shuts down.

---

Step 1: Click the extension icon, then **Set up my tracking sheet** and sign in to Google.
Step 2: Click **Open my sheet** to see your new "Mangago Reading List" sheet.
Step 3: Go to any manga on mangago and add it to your 'Want to Read', 'Reading' or 'Already Read' list and you will see that manga in your Spreadsheet.
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
  Extension UI for creating your sheet and testing the connection

- **help.html / help.js**  
  Setup Guide and Troubleshooting page, opened from the popup

- **icons/**  
  Extension icons used by Chrome

---

## 🚀 How It Works
1. The extension creates a Google Sheet for you, after you sign in with Google
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
Install it from the **[Chrome Web Store](https://chromewebstore.google.com/detail/hekjmppkcgbfenheehhhiibdajdpaigi)**, then click the extension icon and **Set up my tracking sheet**.

It works in Chrome, Brave, Microsoft Edge and Opera, all from the same Chrome Web Store listing. In Brave, first turn on **Allow Google login for extensions** in `brave://settings/extensions`.

### Installing from source (for developers)

1. On this page, click **Code → Download ZIP** and unzip it
2. Open Chrome and go to: `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked**
5. Select the unzipped folder

The extension ID shown in `chrome://extensions` should be `gpojgbkdeecfajdfnjllinahgaphpmki`. If it's different, you have an old copy: remove it and download again.

The extension can only see the spreadsheet it creates for you. It can't open any of your other Google files.

---

## 📄 Google Sheets Setup
1. Open the extension popup
2. Click **Set up my tracking sheet**
3. Approve Google sign-in
4. If the extension made a sheet for you before, pick it to keep using it, or create a new one
5. Click **Open my sheet** to see it

New sheets are created in your Google Drive with headers already in place. Reinstalling or on a new computer? Set up again with the same Google account and your earlier sheet will be offered.

---

## 🧪 Usage
1. Open a manga page on Mangago
2. Click Want to read, Now reading, or Already read
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
- There are two OAuth clients (Google Cloud → Google Auth Platform → Clients):
  - **Web Store**: `389786177817-vik2…`, Item ID `hekjmppkcgbfenheehhhiibdajdpaigi`. Used by `store/build_zip.py`.
  - **GitHub installs**: `389786177817-kgem…`, Item ID `gpojgbkdeecfajdfnjllinahgaphpmki`. Used by `manifest.json` in this repo.
- Browsers other than Chrome (Brave, Edge, Opera) can't use `chrome.identity.getAuthToken`, so `background.js` signs them in with `launchWebAuthFlow` and a third client, **Web application** `389786177817-tfah…` (`WEB_CLIENT_ID`). Its redirect URIs are `https://<extension ID>.chromiumapp.org/` for both IDs above.
- The `key` in `manifest.json` gives every source install the same ID so the GitHub client accepts it. Don't remove it.
- To publish a store update, see [store/LISTING.md](store/LISTING.md).
- `key.pem` is the private half of that key. It is gitignored; keep a backup.
- If you fork this and use your own OAuth client, replace `oauth2.client_id` in `manifest.json` and remove `key` (or generate your own).
