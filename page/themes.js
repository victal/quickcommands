/* exported updateTheme */
// TODO: Get rid of this
const defaultTheme = {
  'main-bg-color': '#ececec',
  'search-bg-color': '#ffffff',
  'main-text-color': '#000000',
  'accent-text-color': '#868686',
  'accent-bg-color': '#4A90D9',
  'selected-text-color': '#ffffff'
}

const applyTheme = (theme) => {
  const html = document.getElementsByTagName('html')[0]
  if (theme) {
    for (const prop of Object.keys(theme)) {
      html.style.setProperty('--' + prop, theme[prop])
    }
  } else {
    applyTheme(defaultTheme)
  }
}

const updateTheme = () => {
  return browser.storage.sync.get('theme').then((results) => {
    applyTheme(results.theme)
  }, () => applyTheme(defaultTheme))
}
