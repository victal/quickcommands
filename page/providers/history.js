/* global closePopup,getLimit,Link,TabList */
const updateHistoryTabs = async (filterText) => {
  filterText = filterText || ''
  return browser.history.search({
    text: filterText,
    startTime: 0,
    maxResults: await getLimit()
  }).then((items) => {
    const usedUrls = []
    const historyTabs = []
    for (const item of items) {
      // crude atttempt at not duplicating urls
      const allowedUrl = !item.url.toLowerCase().startsWith('place') && !item.url.toLowerCase().startsWith('about')
      const url = new URL(item.url)
      const cleanUrl = item.url.replace(url.hash, '')
      if (usedUrls.indexOf(cleanUrl) === -1 && item.title.trim().length > 0 && allowedUrl) {
        const link = new Link(cleanUrl, item.title, 'history' + items.indexOf(item), closePopup)
        historyTabs.push(link)
        usedUrls.push(cleanUrl)
      }
    }
    return historyTabs
  })
}

/* exported historyList */
const historyList = new TabList('History', updateHistoryTabs)
