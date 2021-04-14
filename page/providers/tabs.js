/* global closePopup,getLimit,Tab,TabList, qcLogger */
const updateTabs = async filterText => {
  try {
    qcLogger.debug('Updating tab list')
    const filterRegex = new RegExp('.*' + filterText + '.*', 'i')
    const tabs = await browser.tabs.query({ currentWindow: false })
    const currentTabs = []
    for (const tab of tabs) {
      if (filterText) {
        if (!(filterRegex.test(tab.title) || filterRegex.test(tab.url))) {
          continue
        }
      }
      currentTabs.push(new Tab(tab.id, tab.title, closePopup))
    }
    qcLogger.debug(`${currentTabs.length} tabs found`)
    const limit = await getLimit()
    qcLogger.debug(`Rendering ${Math.min(limit, currentTabs.length)} tabs`)
    return currentTabs.slice(0, limit)
  } catch (e) {
    qcLogger.debug(e)
  }
}

/* exported tabsList */
const tabsList = new TabList('Tabs', updateTabs)
