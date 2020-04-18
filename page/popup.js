/* global Tab,getLimit,Link,updateTheme,TabList*/
const closeUp = async () => {
  console.log('Closing up')
  const url = browser.extension.getURL('page/popup.html')
  await browser.history.deleteUrl({ url: url + '#' })
  const winId = browser.windows.WINDOW_ID_CURRENT
  return browser.windows.get(winId).then(async (winData) => {
    await browser.windows.remove(winData.id)
  })
}

const updateTabs = (filterText) => {
  const filterRegex = new RegExp('.*' + filterText + '.*', 'i')
  return browser.tabs.query({
    currentWindow: false
  }).then(async (tabs) => {
    const currentTabs = []
    for (const tab of tabs) {
      if (filterText) {
        if (!(filterRegex.test(tab.title) || filterRegex.test(tab.url))) {
          continue
        }
      }
      const tabElement = new Tab(tab.id, tab.title, closeUp)
      currentTabs.push(tabElement)
    }
    const limit = await getLimit()
    return currentTabs.slice(0, limit)
  })
}

const updateBookmarks = (filterText) => {
  filterText = filterText || ''
  return browser.bookmarks.search({
    query: filterText
  }).then(async (items) => {
    const tabs = []
    const usedUrls = []
    const limit = await getLimit()
    for (const item of items) {
      if (item.type === 'bookmark' && item.title.trim().length > 0) {
        // Limit bookmarks to http.* because of limitations on what we can open from an extension
        const url = new URL(item.url)
        const cleanUrl = item.url.replace(url.hash, '').replace(url.search, '')
        const allowedUrl = !item.url.toLowerCase().startsWith('place') && !item.url.toLowerCase().startsWith('about')
        if (allowedUrl && usedUrls.indexOf(cleanUrl) === -1) {
          tabs.push(new Link(item.url, item.title, 'bookmark' + item.id, closeUp))
          usedUrls.push(cleanUrl)
        }
      }
      if (tabs.length === limit) {
        return tabs
      }
    }
    return tabs
  })
}

const updateHistoryTabs = async (filterText) => {
  filterText = filterText || ''
  return browser.history.search({
    text: filterText,
    startTime: 0,
    maxResults: await getLimit()
  }).then((items) => {
    const usedUrls = []
    const historyTabs = []
    for (const item of items) {
      // crude atttempt at not duplicating urls
      const allowedUrl = !item.url.toLowerCase().startsWith('place') && !item.url.toLowerCase().startsWith('about')
      const url = new URL(item.url)
      const cleanUrl = item.url.replace(url.hash, '')
      if (usedUrls.indexOf(cleanUrl) === -1 && item.title.trim().length > 0 && allowedUrl) {
        const link = new Link(cleanUrl, item.title, 'history' + items.indexOf(item))
        historyTabs.push(link)
        usedUrls.push(cleanUrl)
      }
    }
    return historyTabs
  })
}

const setupInputFilter = (lists) => {
  const searchInput = document.getElementById('search')
  // Use keydown instead of keyup to prevent the cursor from moving
  searchInput.addEventListener('keydown', (event) => {
    switch (event.key) {
    case 'ArrowDown':
      selectNext(lists)
      event.preventDefault()
      break
    case 'ArrowUp':
      selectPrevious(lists)
      event.preventDefault()
      break
    case 'Enter':
      openSelectedTab(lists)
      event.preventDefault()
      break
    case 'Escape':
      closeUp()
      break
    case 'ArrowLeft':
    case 'ArrowRight':
      // ignored
      break
    default:
      break
    }
  })
  searchInput.addEventListener('keyup', (event) => {
    switch (event.key) {
    case 'ArrowDown':
    case 'ArrowUp':
    case 'Enter':
    case 'ArrowLeft':
    case 'ArrowRight':
    case 'Escape':
      // ignored
      break
    default:
      updateAll(lists, searchInput.value)
      break
    }
  })
  searchInput.focus()
  searchInput.addEventListener('blur', () => {
    setTimeout(() => {
      searchInput.focus()
    }, 10)
  })
}


const reRender = (lists) => {
  const entryList = document.getElementById('entryList')
  while (entryList.lastChild) {
    entryList.removeChild(entryList.lastChild)
  }

  const currentItems = document.createDocumentFragment()
  for (const tabList of lists) {
    if (tabList.length > 0) {
      const tabSeparator = document.createElement('li')
      tabSeparator.classList.add('separator')
      const separatorName = document.createElement('span')
      separatorName.textContent = tabList.title
      separatorName.classList.add('pull-left')
      const count = document.createElement('span')
      count.textContent = tabList.length
      count.classList.add('count')
      count.classList.add('pull-right')
      tabSeparator.appendChild(separatorName)
      tabSeparator.appendChild(count)
      currentItems.appendChild(tabSeparator)
      for (const tab of tabList.tabs) {
        currentItems.appendChild(tab.render())
      }
    }
  }
  entryList.appendChild(currentItems)
  if (lists.length > 0) {
    for (const tabList of lists) {
      if (tabList.length > 0) {
        tabList.selectFirst()
        return
      }
    }
  }
}

const openSelectedTab = (lists) => {
  for (const tabList of lists) {
    if (tabList.hasSelected()) {
      tabList.selected.open()
    }
  }
}

const selectNext = (lists) => {
  for (const tabList of lists) {
    if (tabList.hasSelected()) {
      const selected = tabList.selectNext()
      if (!selected) {
        const ind = lists.indexOf(tabList)
        tabList.unselectAll()
        let selected = false; let nextInd = ind + 1
        while (!selected) {
          selected = lists[nextInd % lists.length].selectFirst()
          nextInd += 1
        }
      }
      return
    }
  }
}

const selectPrevious = (lists) => {
  for (const tabList of lists) {
    if (tabList.hasSelected()) {
      const selected = tabList.selectPrev()
      if (!selected) {
        const ind = lists.indexOf(tabList)
        tabList.unselectAll()
        let selected = false; let nextInd = ind - 1 + lists.length
        while (!selected) {
          selected = lists[nextInd % lists.length].selectLast()
          nextInd -= 1
        }
      }
      return
    }
  }
}

const updateAll = (lists, filterText) => {
  let result = Promise.resolve()
  lists.forEach((l) => {
    result = result.then(() => {
      return l.update(filterText)
    })
  })
  return result.then(() => {
    return reRender(lists)
  })
}

const startUp = () => {
  const url = browser.extension.getURL('page/popup.html')
  updateTheme().then(() => {
    return browser.history.deleteUrl({ url }).then(() => {
      console.debug('Extension page removed from history')
      const lists = [
        new TabList('Tabs', updateTabs),
        new TabList('History', updateHistoryTabs),
        new TabList('Bookmarks', updateBookmarks)
      ]
      setupInputFilter(lists)
      return updateAll(lists, null).then(() => {
        return browser.windows.getCurrent((win) => {
          browser.windows.onFocusChanged.addListener(removePopupOnFocusChange(win.id))
        })
      })
    })
  })
}
document.addEventListener('DOMContentLoaded', startUp)

const removePopupOnFocusChange = currentId => focusedId => {
  if (currentId !== focusedId) {
    browser.windows.onFocusChanged.removeListener(removePopupOnFocusChange)
    browser.windows.remove(currentId)
  }
}

// Save window size when closed
// Uses runtime.sendMessage to avoid race conditions with async
// functions that deal with browser.storage
window.addEventListener('beforeunload', () => {
  browser.runtime.sendMessage({
    popupWindow: {
      height: window.outerHeight,
      width: window.outerWidth
    }
  }).then(message => console.info(message.response), error => console.error(error))
})
