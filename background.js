const getPopupData = async () => {
  const data = await browser.storage.local.get('popup')
  return Object.assign({}, data.popup)
}

const openPopup = async () => {
  const url = browser.extension.getURL('page/popup.html')
  // Prevent the popup from opening multiple times
  const tabs = await browser.tabs.query({url})
  if (tabs.length > 0) {
    console.log({tabs})
    return
  }
  const popupData = await getPopupData()
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


browser.commands.onCommand.addListener((command) => {
  console.log('onCommand event received for message: ', command)
  return openPopup(command)
})

browser.browserAction.onClicked.addListener(openPopup)
browser.runtime.onMessage.addListener(updatePopupData)

// Reset popup visibility in case firefox was forcibly closed
getPopupData().then((data) => {
  browser.storage.local.set({
    popup: data
  })
})
