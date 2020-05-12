/* global closePopup,getLimit,Tab,TabList */
const updateTabs = (filterText) => {
  const filterRegex = new RegExp('.*' + filterText + '.*', 'i')
  return browser.tabs.query({
    currentWindow: false
  }).then(async (tabs) => {
    const currentTabs = []
    for (const tab of tabs) {
      if (filterText) {
        if (!(filterRegex.test(tab.title) || filterRegex.test(tab.url))) {
          continue
        }
      }
      currentTabs.push(new Tab(tab.id, tab.title, closePopup))
    }
    const limit = await getLimit()
    return currentTabs.slice(0, limit)
  })
}

/* exported tabsList */
const tabsList = new TabList('Tabs', updateTabs)
