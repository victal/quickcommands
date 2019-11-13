const getPopupData = async () => {
  const data = await browser.storage.local.get('popup')
  return Object.assign({}, data.popup)
}

const openPopup = async () => {
  // Prevent the popup from opening multiple times
  const popupData = await getPopupData()
  if (popupData.visible) {
    return
  }
  const url = browser.extension.getURL('page/popup.html')
  const winData = await browser.windows.create({
    type: 'detached_panel',
    url,
    width: popupData.width || 599,
    height: popupData.height || 500
  })
  // Update the popup data to reflect its visibility status and window ID
  await browser.storage.local.set({
    popup: {
      id: winData.id,
      visible: true,
      width: winData.width,
      height: winData.height
    }
  })
  // Deletion from history is done on the page Javascript to ensure loading from history doesn't include it
  // Window focus change listener is added in the page Javascript to ensure the listener does not trigger until the page is fully loaded
}

const updatePopupData = async (request, sender, sendResponse) => {
  console.debug('Saving window dimensions:', request.popupWindow)
  const winData = await getPopupData()
  await browser.storage.local.set({
    popup: {
      id: winData.id,
      visible: false,
      width: request.popupWindow.width,
      height: request.popupWindow.height
    }
  })
  sendResponse({ response: 'Successfully saved window dimensions.' })
}

browser.commands.onCommand.addListener((command) => {
  console.log('onCommand event received for message: ', command)
  return openPopup()
})

browser.browserAction.onClicked.addListener(openPopup)
browser.runtime.onMessage.addListener(updatePopupData)

// Reset popup visibility in case firefox was forcibly closed
getPopupData().then((data) => {
  data.visible = false
  browser.storage.local.set({
    popup: data
  })
})
