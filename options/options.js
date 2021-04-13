/* global getLimit */

const themes = {
  default: {
    'main-bg-color': '#ececec',
    'search-bg-color': '#ffffff',
    'main-text-color': '#000000',
    'accent-bg-color': '#4A90D9',
    'accent-text-color': '#868686',
    'selected-text-color': '#ffffff'
  },
  dark: {
    'main-bg-color': '#26272a',
    'search-bg-color': '#1f2022',
    'main-text-color': '#ececec',
    'accent-bg-color': '#006ed7',
    'accent-text-color': '#7b7b7d',
    'selected-text-color': '#f8fbfe'
  }
}

let selectedTheme = themes.default

const getTheme = (themeName) => {
  if (themeName === 'custom') {
    const inputs = document.querySelectorAll('#custom  input')
    const theme = {}
    for (let input of inputs) {
      theme[input.getAttribute('id')] = input.value
    }
    return theme
  }
  return themes[themeName]
}

const save = (event) => {
  event.preventDefault()
  const themeName = document.getElementById('theme').value
  const theme = getTheme(themeName)
  browser.storage.sync.set({
    theme,
    themeName,
    limit: getLimitValue()
  })
  return false
}

const toggleCustomColors = (event) => {
  const theme = event.target.value
  if (theme === 'custom') {
    document.getElementById('custom').style.display = 'block'
    if (selectedTheme) {
      const inputs = document.querySelectorAll('#custom input')
      for (let input of inputs) {
        input.value = selectedTheme[input.getAttribute('id')]
      }
      selectedTheme = null
    }
  } else {
    document.getElementById('custom').style.display = 'none'
    selectedTheme = themes[theme]
  }
}

const doUpdatePreview = (theme) => {
  const preview = document.getElementById('preview')
  for (const key of Object.keys(theme)) {
    preview.style.setProperty('--' + key, theme[key])
  }
}
const updateLivePreview = (event) => {
  const theme = getTheme(event.target.value)
  doUpdatePreview(theme)
}

const restoreOptions = async () => {
  const themeObj = await browser.storage.sync.get(['themeName', 'theme'])
  const themeName = themeObj.themeName || 'default'
  const theme = themeObj.theme || themes.default
  document.querySelector('#theme').value = themeName
  if (themeName === 'custom') {
    const inputs = document.querySelectorAll('#custom  input')
    for (let input of inputs) {
      input.value = theme[input.getAttribute('id')]
    }
    document.getElementById('custom').style.display = 'block'
  }
  doUpdatePreview(theme)
  await updateLimitUI()
}

const updatePreviewProperty = (event) => {
  const input = event.target
  const preview = document.getElementById('preview')
  preview.style.setProperty('--' + input.getAttribute('id'), input.value)
}

const getLimitValue = () => {
  return document.querySelector('input[name=\'limit\']').valueAsNumber
}

const updateLimitUI = async () => {
  document.querySelector('input[name=\'limit\']').value = await getLimit()
}

const saveLogFile  = (logName, log) => {
  const url = URL.createObjectURL(new Blob(log, {type: 'text/plain'}))
  // const url = URL.createObjectURL(new Blob([JSON.stringify(log)], {type: 'text/plain'}))
  browser.downloads.download({ url, filename: logName })
}

const start = () => {
  document.getElementById('form').addEventListener('submit', save)
  document.getElementById('theme').addEventListener('change', toggleCustomColors)
  document.getElementById('theme').addEventListener('change', updateLivePreview)
  for (const input of document.querySelectorAll('input[type=color]')) {
    input.addEventListener('change', updatePreviewProperty)
  }
  document.getElementById("options_export_debug").addEventListener('click', function(event) {
    if (event.which === 1) {
      chrome.storage.local.get(null, function(storage) {
        saveLogFile("quickcommands.log", storage.log)
      })
    }
  })
  
  restoreOptions()
}
document.addEventListener('DOMContentLoaded', start)
