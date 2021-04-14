/* global logLevels */
const globalVars = {
  logs: [],
  shouldSaveLogs: false
}

const addLog = (level, log) => {
  const currentLogLevel = logLevels.indexOf('debug')
  if (logLevels.indexOf(level) <= currentLogLevel) {
    const fullLog = `[${level.toUpperCase()}] ${Date.now()} ${log}\n`
    console.debug(`[Quickcommands] ${fullLog}`)
    globalVars.logs.push(fullLog)
    globalVars.shouldSaveLogs = true
  }
}


const logMessage = ({ level, log }) => addLog(level, log)

const getPopupData = async () => {
  const data = await browser.storage.local.get('popup')
  return Object.assign({}, data.popup)
}

const openPopup = async () => {
  const url = browser.extension.getURL('page/popup.html')

  // Prevent the popup from opening multiple times
  const tabs = await browser.tabs.query({url})
  if (tabs.length === 0) {
    addLog('info', 'Loading extension popup')
    try {
      const popupData = await getPopupData()
      await browser.windows.create({
        type: 'detached_panel',
        url,
        width: popupData.width || 599,
        height: popupData.height || 500
      })
    } catch (e) {
      addLog('error', e)
    }
    addLog('info', 'Extension popup loaded')
  }
  // Deletion from history is done on the page Javascript to ensure loading from history doesn't include it
  // Window focus change listener is added in the page Javascript to ensure the listener does not trigger until the page is fully loaded
}

const updatePopupData = request => browser.storage.local.set({
  popup: {
    width: request.popupWindow.width,
    height: request.popupWindow.height
  }
})

const messageCommands = {
  updatePopupData,
  log: logMessage
}

const messageListener = ({command, data}) => {
  const messageCommand = messageCommands[command]
  if (!messageCommand) {
    return addLog(`Message listener not found for command: ${command}`)
  }
  return messageCommand(data)
}

const autoSaveLogs = () =>
  setInterval(() => {
    if (globalVars.shouldSaveLogs) {
      chrome.storage.local.set({ log: globalVars.logs })
      globalVars.shouldSaveLogs = false
    }
  }, 1000)

document.addEventListener('DOMContentLoaded', function() {
  autoSaveLogs()
  browser.runtime.onMessage.addListener(messageListener)
  browser.commands.onCommand.addListener(openPopup)
  browser.browserAction.onClicked.addListener(openPopup)
})
