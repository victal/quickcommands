async function getLimit() {
  const store = await browser.storage.sync.get('limit');
  return store.limit || 100;
}

function setLimit(limit) {
  return browser.storage.sync.set({limit});
}
