# Empty Files Cleaner NP

An [Obsidian](https://obsidian.md) plugin that scans your vault for empty notes and lets you delete them in bulk.

![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22empty-files-cleaner-np%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Features

- 🔍 **Scans your entire vault** for markdown files with no content (or only whitespace)
- ☑️ **Checkbox list** — select individual files or use "Select all" / "Deselect all"
- 🗑️ **Bulk delete** — remove all selected files in one click with a confirmation prompt
- 🔄 **Auto-refresh** — the list updates automatically after deletion
- ✅ **Safe** — always asks for confirmation before deleting anything

## Installation

### Manual

1. Download the latest release from the [Releases](https://github.com/leruetkins/obsidian-empty-files-cleaner-np/releases) page
2. Extract the archive and copy the folder to your vault's plugins directory:
   ```
   <your vault>/.obsidian/plugins/empty-files-cleaner-np/
   ```
3. In Obsidian: go to **Settings → Community plugins**, find **Empty Files Cleaner NP** and enable it

### From Obsidian Community Plugins

Search for **"Empty Files Cleaner NP"** in **Settings → Community plugins → Browse**.

## Usage

There are two ways to open the plugin:

1. **Ribbon icon** — click the 🗑️ trash icon in the left sidebar
2. **Command Palette** — open with `Ctrl/Cmd + P` and search for `Find and delete empty files`

### In the modal window:

| Action | Description |
|--------|-------------|
| **Select all** | Check all files in the list |
| **Deselect all** | Uncheck all files |
| Click a row | Toggle checkbox for that file |
| **Delete selected (N)** | Permanently delete the checked files |
| **Cancel** | Close without deleting anything |

> ⚠️ **Deletion is permanent.** Files are not moved to trash — they are removed directly from the vault.

## Building from Source

```bash
git clone https://github.com/leruetkins/obsidian-empty-files-cleaner-np
cd obsidian-empty-files-cleaner-np
npm install
npm run build
```

The compiled `main.js` will appear in the project root.

## Contributing

Pull requests and issues are welcome on [GitHub](https://github.com/leruetkins/obsidian-empty-files-cleaner-np).

## License

[MIT](LICENSE) © [leruetkins](https://github.com/leruetkins)
