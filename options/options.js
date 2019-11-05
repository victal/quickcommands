/* global getLimit */

const commandName = 'quick-commands'
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

function commandUpdateSupported () {
  return Object.prototype.hasOwnProperty.call(browser.commands, 'update')
}

function getTheme (themeName) {
  if (themeName === 'custom') {
    const inputs = document.querySelectorAll('#custom  input')
    const theme = {}
    for (var input of inputs) {
      theme[input.getAttribute('id')] = input.value
    }
    return theme
  }
  return themes[themeName]
}

function save (event) {
  event.preventDefault()
  const themeName = document.getElementById('theme').value
  const theme = getTheme(themeName)
  browser.storage.sync.set({
    theme: theme,
    themeName: themeName,
    limit: getLimitValue()
  })
  if (commandUpdateSupported()) {
    updateShortcut()
  }
  return false
}

function toggleCustomColors (event) {
  const theme = event.target.value
  if (theme === 'custom') {
    document.getElementById('custom').style.display = 'block'
    if (selectedTheme) {
      const inputs = document.querySelectorAll('#custom input')
      for (var input of inputs) {
        input.value = selectedTheme[input.getAttribute('id')]
      }
      selectedTheme = null
    }
  } else {
    document.getElementById('custom').style.display = 'none'
    selectedTheme = themes[theme]
  }
}

function doUpdatePreview (theme) {
  const preview = document.getElementById('preview')
  for (const key of Object.keys(theme)) {
    preview.style.setProperty('--' + key, theme[key])
  }
}
function updateLivePreview (event) {
  const theme = getTheme(event.target.value)
  doUpdatePreview(theme)
}

async function restoreOptions () {
  const themeObj = await browser.storage.sync.get(['themeName', 'theme'])
  const themeName = themeObj.themeName || 'default'
  const theme = themeObj.theme || themes.default
  document.querySelector('#theme').value = themeName
  if (themeName === 'custom') {
    const inputs = document.querySelectorAll('#custom  input')
    for (var input of inputs) {
      input.value = theme[input.getAttribute('id')]
    }
    document.getElementById('custom').style.display = 'block'
  }
  doUpdatePreview(theme)
  await updateLimitUI()

  if (commandUpdateSupported()) {
    await updateShortcutUI()
  }
}

function updatePreviewProperty (event) {
  const input = event.target
  const preview = document.getElementById('preview')
  preview.style.setProperty('--' + input.getAttribute('id'), input.value)
}

function updateShortcut () {
  const activator = document.querySelector('#shortcut').value
  const modifiers = Array.from(document.querySelectorAll('#shortcutBlock input[name=\'modifier\'], #shortcutBlock input[name=\'shift\']'))
    .filter(f => f.checked)
    .map(f => f.value)
  modifiers.push(activator)
  const shortcut = modifiers.join('+')

  browser.commands.update({
    name: commandName,
    shortcut
  })
}

async function updateShortcutUI () {
  document.getElementById('shortcutBlock').style.display = 'block'
  const commands = await browser.commands.getAll()
  for (const command of commands) {
    if (command.name === commandName) {
      populateShortcutSettings(command.shortcut)
    }
  }
}

function populateShortcutSettings (shortcut) {
  const keys = shortcut.split('+')
  const activator = keys.pop()
  keys.forEach(modifier => {
    document.querySelector(`#shortcutBlock input[value='${modifier}']`).setAttribute('checked', true)
  })
  document.querySelector('#shortcut').value = activator
}

function resetShortcut () {
  browser.commands.reset(commandName)
  updateShortcutUI()
}

function getLimitValue () {
  return document.querySelector('input[name=\'limit\']').valueAsNumber
}

async function updateLimitUI () {
  document.querySelector('input[name=\'limit\']').value = await getLimit()
}

function start () {
  document.getElementById('form').addEventListener('submit', save)
  document.getElementById('theme').addEventListener('change', toggleCustomColors)
  document.getElementById('theme').addEventListener('change', updateLivePreview)
  document.getElementById('reset_shortcut').addEventListener('click', resetShortcut)
  for (const input of document.querySelectorAll('input[type=color]')) {
    input.addEventListener('change', updatePreviewProperty)
  }
  restoreOptions()
}
document.addEventListener('DOMContentLoaded', start)
