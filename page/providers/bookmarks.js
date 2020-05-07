const updateBookmarks = (filterText) => {
  filterText = filterText || ''
  return browser.bookmarks.search({
    query: filterText
  }).then(async (items) => {
    const tabs = []
    const usedUrls = []
    const limit = await getLimit()
    for (const item of items) {
      if (item.type === 'bookmark' && item.title.trim().length > 0) {
        // Limit bookmarks to http.* because of limitations on what we can open from an extension
        const url = new URL(item.url)
        const cleanUrl = item.url.replace(url.hash, '').replace(url.search, '')
        const allowedUrl = !item.url.toLowerCase().startsWith('place') && !item.url.toLowerCase().startsWith('about')
        if (allowedUrl && usedUrls.indexOf(cleanUrl) === -1) {
          tabs.push(new Link(item.url, item.title, 'bookmark' + item.id, closePopup))
          usedUrls.push(cleanUrl)
        }
      }
      if (tabs.length === limit) {
        return tabs
      }
    }
    return tabs
  })
}

const bookmarksList = new TabList('Bookmarks', updateBookmarks)
