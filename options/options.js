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

let selectedTheme = themes['default']

function commandUpdateSupported() {
  return browser.commands.hasOwnProperty('update')
}

function getTheme(themeName) {
  if (themeName === 'custom') {
    let inputs = document.querySelectorAll('#custom  input')
    let theme = {}
    for (var input of inputs) {
      theme[input.getAttribute('id')] = input.value
    }
    return theme
  }
  return themes[themeName]
}

function save(event) {
  let themeName = document.getElementById('theme').value
  let theme = getTheme(themeName)
  browser.storage.sync.set({
    theme: theme,
    themeName: themeName
  })
  if (commandUpdateSupported()) {
    updateShortcut()
  }
  event.preventDefault()
  return false
}

function toggleCustomColors(event) {
  let theme = event.target.value
  if (theme === 'custom') {
    document.getElementById('custom').style.display = 'block'
    if (selectedTheme) {
      let inputs = document.querySelectorAll('#custom input')
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

function doUpdatePreview(theme) {
  let preview = document.getElementById('preview')
  for (const key of Object.keys(theme)) {
    preview.style.setProperty('--' + key, theme[key])
  }
}
function updateLivePreview(event) {
  let theme = getTheme(event.target.value)
  doUpdatePreview(theme)
}

async function restoreOptions() {
  let themeObj = await browser.storage.sync.get(['themeName', 'theme'])
  let themeName = themeObj.themeName || 'default'
  let theme = themeObj.theme || themes['default']
  document.querySelector('#theme').value = themeName
  if (themeName == 'custom') {
    let inputs = document.querySelectorAll('#custom  input')
    for (var input of inputs) {
      input.value = theme[input.getAttribute('id')]
    }
    document.getElementById('custom').style.display = 'block'
  }
  doUpdatePreview(theme)
  if (commandUpdateSupported()) {
    updateShortcutUI()
  }
}

function updatePreviewProperty(event) {
  let input = event.target
  let preview = document.getElementById('preview')
  preview.style.setProperty('--' + input.getAttribute('id'), input.value)
}

function updateShortcut() {
  let activator = document.querySelector('#shortcut').value
  let modifiers = Array.from(
    document.querySelectorAll(
      `#shortcutBlock input[name='modifier'], #shortcutBlock input[name='shift']`
    )
  )
    .filter(f => f.checked)
    .map(f => f.value)
  modifiers.push(activator)
  let shortcut = modifiers.join('+')

  browser.commands.update({
    name: commandName,
    shortcut
  })
}

async function updateShortcutUI() {
  document.getElementById('shortcutBlock').style.display = 'block'
  let commands = await browser.commands.getAll()
  for (command of commands) {
    if (command.name === commandName) {
      populateShortcutSettings(command.shortcut)
    }
  }
}

function populateShortcutSettings(shortcut) {
  let keys = shortcut.split('+')
  let activator = keys.pop()
  keys.forEach(modifier => {
    document
      .querySelector(`#shortcutBlock input[value='${modifier}']`)
      .setAttribute('checked', true)
  })
  document.querySelector('#shortcut').value = activator
}

function resetShortcut() {
  browser.commands.reset(commandName)
  updateShortcutUI()
}

function start() {
  document.getElementById('form').addEventListener('submit', save)
  document
    .getElementById('theme')
    .addEventListener('change', toggleCustomColors)
  document.getElementById('theme').addEventListener('change', updateLivePreview)
  document
    .getElementById('reset_shortcut')
    .addEventListener('click', resetShortcut)
  for (const input of document.querySelectorAll('input[type=color]')) {
    input.addEventListener('change', updatePreviewProperty)
  }
  restoreOptions()
}
document.addEventListener('DOMContentLoaded', start)
