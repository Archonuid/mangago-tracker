"""Build the Chrome Web Store upload zip.

The store assigns its own extension ID (hekjmppkcgbfenheehhhiibdajdpaigi),
so the uploaded copy drops the manifest's "key" (which pins the ID for GitHub
installs) and swaps in the OAuth client registered for the store ID.

Usage: python store/build_zip.py
"""

import json
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
# OAuth client whose Item ID is the Web Store extension ID
STORE_CLIENT_ID = '389786177817-vik2bivbfnjeqe88ihqmdkrio2v0jgmi.apps.googleusercontent.com'

FILES = [
    'background.js',
    'content.js',
    'popup.html',
    'popup.js',
    'help.html',
    'help.js',
    'icons/icon16.png',
    'icons/icon48.png',
    'icons/icon128.png',
]


def main():
    manifest = json.loads((ROOT / 'manifest.json').read_text(encoding='utf-8'))
    manifest.pop('key', None)
    manifest['oauth2']['client_id'] = STORE_CLIENT_ID

    out = ROOT / 'store' / f"mangago-tracker-{manifest['version']}.zip"
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr('manifest.json', json.dumps(manifest, indent=2) + '\n')
        for name in FILES:
            z.write(ROOT / name, name)

    print(out)


if __name__ == '__main__':
    main()
