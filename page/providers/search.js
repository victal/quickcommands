/* global closePopup,Search,TabList */
const updateSearch = async (filterText) => {
  if (!filterText) {
    return []
  }
  const searchEngines = await browser.search.get()
  if (searchEngines.length === 0) {
    return []
  }
  const defaultEngines = searchEngines.filter(engine => engine.isDefault)
  let defaultEngine = searchEngines[0]
  if (defaultEngines.length > 0) {
    defaultEngine = defaultEngines[0]
  }
  return [new Search(defaultEngine, filterText, closePopup)]
}

/* exported searchList */
const searchList = new TabList('', updateSearch, false)
