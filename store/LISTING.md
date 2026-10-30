# Chrome Web Store listing

Live listing: https://chromewebstore.google.com/detail/hekjmppkcgbfenheehhhiibdajdpaigi
Dashboard: https://chrome.google.com/webstore/devconsole

## Publishing an update

1. Bump `version` in `manifest.json`.
2. Run `python store/build_zip.py`.
3. In the dashboard, open the item → **Package** → **Upload new package**, pick `store/mangago-tracker-<version>.zip`, then **Submit for review**.

The script strips the manifest `key` and uses the OAuth client registered for the store ID (`389786177817-vik2…`). GitHub installs use a separate client (`389786177817-kgem…`, Item ID `gpojgbkdeecfajdfnjllinahgaphpmki`).

If you change the listing, the text below is a starting point.

## Store listing tab

**Description**

> Never lose your Mangago reading lists again.
>
> Manga sites go down, and when they do, reading lists often disappear with them. Mangago Reading List Tracker copies your lists into a Google Sheet in your own Google Drive, so you keep them even if a site goes offline.
>
> How it works
> • Click "Set up my tracking sheet" once and sign in with Google.
> • Browse Mangago as usual. When you add a manga to Want to Read, Reading or Already Read, it appears in your sheet.
> • Each row has the title, status, last chapter and a link back to the page.
> • No duplicates. Changing a manga's status updates its existing row.
>
> Private by design
> • The extension can only see the one spreadsheet it creates. It can't open any of your other Google files.
> • No servers, no accounts, no ads, no analytics, no tracking. Your data goes straight from your browser to your own Google Sheet.
>
> Not affiliated with Mangago.

**Category:** Productivity → Tools

**Language:** English

**Graphics**
- Store icon: `icons/icon128.png`
- Screenshots (at least 1, 1280×800 or 640×400): the popup after creating a sheet, and the sheet with a few rows in it.
- Small promo tile (440×280): optional.

**Additional fields**
- Homepage URL: https://archonuid.github.io/mangago-tracker/
- Support URL: https://github.com/Archonuid/mangago-tracker/issues

## Privacy practices tab

**Single purpose**

> Saves the manga a user adds to their Mangago reading lists into a Google Sheet that the extension creates in the user's own Google Drive.

**Permission justifications**

| Permission | Justification |
|---|---|
| `storage` | Remembers the ID of the user's tracking spreadsheet so syncing keeps working across browser restarts. |
| `identity` | Signs the user in with Google to get permission to create and write to their tracking spreadsheet. |
| Host: `https://www.mangago.me/*` | Detects when the user adds a manga to a reading list on Mangago and reads its title, chapter and page URL. |
| Host: `https://sheets.googleapis.com/*` | Creates the user's tracking spreadsheet and writes rows to it through the Google Sheets API. |

**Remote code:** No, I am not using remote code.

**Data usage.** Tick:
- Web history (the Mangago page URLs written to the sheet)
- Website content (manga titles and chapters written to the sheet)

Then tick all three certifications:
- I do not sell or transfer user data to third parties, outside of the approved use cases.
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose.
- I do not use or transfer user data to determine creditworthiness or for lending purposes.

**Privacy policy URL:** https://archonuid.github.io/mangago-tracker/privacy.html

## Distribution tab

- Visibility: Public
- Regions: All regions
