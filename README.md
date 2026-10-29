# mangago-tracker
Automatically sync your Mangago reading lists to Google Sheets

## Install

1. Download `mangago-tracker.zip` from this repo and unzip it.
2. Open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked**, and pick the unzipped folder.
3. Click the extension icon, then **Setup Guide** for the remaining steps.

The extension ID should be `gpojgbkdeecfajdfnjllinahgaphpmki`. The `key` in `manifest.json` keeps it the same on every install, which Google sign-in depends on.

## Maintainer notes

The OAuth client in Google Cloud Console (APIs & Services → Credentials) must be a **Chrome Extension** client with Item ID `gpojgbkdeecfajdfnjllinahgaphpmki`. If the ID in the manifest's `oauth2.client_id` is ever regenerated, update it here too.

`key.pem` is the private half of the manifest key. It is gitignored. Keep a backup; it's only needed to pack a `.crx` with the same ID.
