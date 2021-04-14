/* global updateTheme, tabsList, commandList, historyList, bookmarksList, searchList, qcLogger */
const closePopup = async () => {
  const url = browser.extension.getURL('page/popup.html')
  await browser.history.deleteUrl({ url: url + '#' })
  window.close()
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
      closePopup()
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
      qcLogger.debug('Focus automatically reset to search input')
      searchInput.focus()
    }, 10)
  })
  qcLogger.debug('Input filter setup finished')
}


const reRender = (lists) => {
  const entryList = document.getElementById('entryList')
  while (entryList.lastChild) {
    entryList.removeChild(entryList.lastChild)
  }

  const currentItems = document.createDocumentFragment()
  for (const tabList of lists) {
    if (tabList.length > 0) {
      if (tabList.title) {
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
      }
      for (const tab of tabList.tabs) {
        currentItems.appendChild(tab.render())
      }
    }
  }
  entryList.appendChild(currentItems)
  for (const tabList of lists) {
    if (tabList.length > 0 && tabList.shouldFocus) {
      if (tabList.selectFirst()) {
        return
      }
    }
  }
  for (const tabList of lists) {
    if (tabList.length > 0) {
      tabList.selectFirst()
      return
    }
  }
}

const openSelectedTab = (lists) => {
  qcLogger.debug('Opening selected tab')
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

const updateAll = (lists, filterText) =>
  Promise.all(lists.map(l => l.update(filterText)))
    .then(() => reRender(lists))

const startUp = async () => {
  const url = browser.extension.getURL('page/popup.html')
  await updateTheme()
  await browser.history.deleteUrl({ url })
  qcLogger.debug('Extension page removed from history')
  const lists = [
    searchList,
    tabsList,
    commandList,
    historyList,
    bookmarksList,
  ]
  setupInputFilter(lists)
  await updateAll(lists, null)
  await browser.windows.getCurrent((win) => {
    browser.windows.onFocusChanged.addListener(removePopupOnFocusChange(win.id))
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
window.addEventListener('beforeunload', () =>
  browser.runtime.sendMessage({
    command: 'updatePopupData',
    data: {
      popupWindow: {
        height: window.outerHeight,
        width: window.outerWidth
      }
    }
  })
)
