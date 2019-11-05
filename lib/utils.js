/* exported getLimit  */
const getLimit = async () => {
  const store = await browser.storage.sync.get('limit')
  return store.limit || 100
}
