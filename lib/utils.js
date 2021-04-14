/* exported getLimit, logLevels */
const getLimit = async () => {
  const store = await browser.storage.sync.get('limit')
  return store.limit || 100
}

const logLevels = [
  'error',
  'warn',
  'info',
  'debug'
]
