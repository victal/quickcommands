# quickcommands

An add-on for Firefox 57+ that adds a fast way to access open tabs and links from History.

Inspired by Vivaldi's [Quick Commands](https://help.vivaldi.com/article/quick-commands/) Menu.

## Installation 

Just click the button below to get to the installation page:

[![Click here!](https://addons.cdn.mozilla.net/static/img/addons-buttons/AMO-button_1.png)](https://addons.mozilla.org/en-US/firefox/addon/quick-commands/)

## Usage

Open the quick-commands window with Alt+Shift+R
Search and browse with the Up/Down Arrows.
Open the selected tab with Enter.
Esc closes the window, and your current shortcut for closing a tab (Ctrl+W/Cmd+W) will work just as well

## Permissions

The following permissions are requested upon installation (most are quite self-explanatory):
- tabs: For searching and switching between current open tabs
- history: To be able to search and display links from history
- bookmarks: To be able to search and display links from your bookmarks
- storage (from 1.0.0 onwards): To save your theme preferences (and sync them between devices if you are logged into your Firefox Account)
- search (from 1.5.0 onwards): To be able to trigger a search using the default Search engine configured in Firefox

## Ideas/Suggestions/Bugs

### Known:
- Open Settings/Downloads/other internal Firefox pages: on hold (most about: pages cant' be opened from extensions)
- Add an entry for 'Search with...': on hold (there's no search engines API yet and I'd rather not hardcode any search engine links into the extension)
- Open issues here on Github

### New:
- Feel free to open a Issue on Github (https://github.com/victal/quickcommands/issues)


## License:

MIT
