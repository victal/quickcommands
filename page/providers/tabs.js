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
      let tabElement = new Tab(tab.id, tab.title, closePopup)
      if (tab.audible) {
        tabElement = new SoundTab(tab.id, tab.title, tab.mutedInfo.muted, closePopup)
      }
      currentTabs.push(tabElement)
    }
    const limit = await getLimit()
    return currentTabs.slice(0, limit)
  })
}

const tabsList = new TabList('Tabs', updateTabs)
