const getPopupData = async () => {
  const data = await browser.storage.local.get('popup')
  return Object.assign({}, data.popup)
}

function onVisited(historyItem) {
  if (historyItem.url == browser.runtime.getURL('page/popup.html')) {
    // return browser.history.deleteUrl({url: historyItem.url})
  }
}

const openPopup = async () => {
  const url = browser.runtime.getURL('page/popup.html')
  // Prevent the popup from opening multiple times
  const tabs = await browser.tabs.query({url})
  if (tabs.length > 0) {
    return
  }
  browser.history.onVisited.addListener(onVisited);
  const popupData = await getPopupData()
  const previousWindow = await browser.windows.getLastFocused()
  await browser.storage.local.set({ previousWindowId: previousWindow.id })
  await browser.windows.create({
    type: 'detached_panel',
    url,
    width: popupData.width || 599,
    height: popupData.height || 500
  })
  // Deletion from history is done on the page Javascript to ensure loading from history doesn't include it
  // Window focus change listener is added in the page Javascript to ensure the listener does not trigger until the page is fully loaded
}

const updatePopupData = (request) => browser.storage.local.set({
  popup: {
    width: request.popupWindow.width,
    height: request.popupWindow.height
  }
})
browser.runtime.onMessage.addListener(updatePopupData)


browser.commands.onCommand.addListener(openPopup)
browser.browserAction.onClicked.addListener(openPopup)
