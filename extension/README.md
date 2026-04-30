# Verdict Helper - Chrome Extension

A Chrome extension that enables one-click code submission to Codeforces from the Verdict.run platform.

## Features

- 🚀 **One-click submission** - Submit code to Codeforces without leaving Verdict.run
- 🔐 **Secure** - Uses your existing Codeforces login session (no password storage)
- ⚡ **Fast** - Silent background submission via the extension
- 📊 **Status tracking** - See your login status and submission results

## Installation (Development)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `extension` folder from this project

## Usage

1. Install the extension
2. Log into Codeforces in your browser
3. Go to any problem on `verdict.run`
4. Write your code and click **Submit to CF**
5. The extension will submit your code automatically!

## File Structure

```
extension/
├── manifest.json      # Extension configuration
├── background.js      # Service worker (handles CF submission)
├── content_script.js  # Injected into Verdict.run pages
├── popup.html         # Extension popup UI
├── popup.js           # Popup logic
├── logo.svg          # Branding
└── icons/             # Extension icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Supported Languages

| Language | Codeforces ID |
|----------|---------------|
| GNU G++17 | 54 |
| GNU G++20 (64 bit) | 89 |
| Python 3 | 31 |
| PyPy 3 | 70 |
| Java 21 | 87 |
| Kotlin 1.9 | 88 |
| Rust 1.75 | 75 |
| Go 1.21 | 32 |

## Troubleshooting

### "Not Logged In" Error
Make sure you're logged into Codeforces in your browser. Open [codeforces.com](https://codeforces.com) and log in.

### "Cloudflare Challenge" Error
Codeforces sometimes shows a browser verification page. Visit [codeforces.com](https://codeforces.com) manually to complete the challenge, then try again.

### Extension Not Detected
Refresh the Verdict.run page after installing the extension.

## Privacy

This extension:
- ✅ Works entirely in your browser
- ✅ Uses your existing Codeforces cookies (never uploaded to any server)
- ✅ Does NOT store your password
- ✅ Does NOT send your code to any server except Codeforces

## Development

To modify the extension:
1. Edit the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Reload the Verdict.run page

