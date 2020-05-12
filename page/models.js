/* exported TabList,Tab,Link,SoundTab */
const getFirstWindow = () => browser.windows.getAll().then(
  windows => browser.windows.get(
    Math.min.apply(Math,
      windows.filter(w => w.type === 'normal').map(w => w.id)
    )
  )
)

class TabList {
  constructor (title, search) {
    this.title = title
    this.search = search
    this.tabs = []
    this.selected = null
  }

  update (filterText) {
    return this.search(filterText).then((results) => {
      this.tabs = results
      this.selected = null
      return results.length
    })
  }

  selectFirst () {
    if (this.tabs.length > 0) {
      this.tabs[0].select()
      this.selected = this.tabs[0]
      return true
    }
    return false
  }

  selectLast () {
    if (this.tabs.length > 0) {
      const ind = this.tabs.length - 1
      this.tabs[ind].select()
      this.selected = this.tabs[ind]
      return true
    }
    return false
  }

  selectNext () {
    const ind = this.tabs.indexOf(this.selected)
    if (ind === this.tabs.length - 1) {
      return false
    }
    this.selected.unselect()
    this.selected = this.tabs[ind + 1]
    this.selected.select()
    return true
  }

  selectPrev () {
    const ind = this.tabs.indexOf(this.selected)
    if (ind === 0) {
      return false
    }
    this.selected.unselect()
    this.selected = this.tabs[ind - 1]
    this.selected.select()
    return true
  }

  hasSelected () {
    return this.selected !== null
  }

  unselectAll () {
    if (this.selected !== null) {
      this.selected.unselect()
      this.selected = null
    }
  }

  get length () {
    return this.tabs.length
  }
}

class Tab {
  constructor (tabID, title, onOpen) {
    this.tabID = tabID
    this.title = title
    this.selected = false
    this.onOpen = onOpen
  }

  render() {
    const tabElement = document.createElement('li')
    tabElement.setAttribute('id', this.tabID)
    tabElement.addEventListener('click', () => {
      this.open()
    })
    const title = document.createElement('span')
    title.textContent = this.title
    title.classList.add('pull-left')
    tabElement.appendChild(title)
    return tabElement
  }

  select () {
    const element = document.getElementById(this.tabID)
    element.classList.add('selected')
    element.scrollIntoView(false)
    this.selected = true
  }

  unselect () {
    document.getElementById(this.tabID).classList.remove('selected')
    this.selected = false
  }

  open () {
    return browser.tabs.update(this.tabID, {
      active: true
    }).then(this.onOpen)
  }
}

class SoundTab extends Tab {
  constructor(tabID, title, muted, onOpen) {
    super(tabID, title, onOpen)
  }
  render() {
    const tabElement = document.createElement('li')
    tabElement.setAttribute('id', this.tabID)
    tabElement.addEventListener('click', () => {
      this.open()
    })
    const icon = document.createElement('span')
    icon.textContent = '🔊'
    icon.classList.add('pull-left')
    icon.classList.add('icon')
    const title = document.createElement('span')
    title.textContent = this.title
    title.classList.add('pull-left')
    tabElement.appendChild(icon)
    tabElement.appendChild(title)
    return tabElement
  }
}


class Link {
  constructor (url, title, id, onOpen) {
    this.url = url
    this.title = title
    this.id = id
    this.selected = false
    this.onOpen = onOpen
  }

  render () {
    const tabElement = document.createElement('li')
    const title = document.createElement('span')
    title.textContent = this.title
    title.classList.add('pull-left')
    title.classList.add('tab-content')
    const url = document.createElement('span')
    url.textContent = this.url
    tabElement.appendChild(title)
    tabElement.appendChild(url)
    tabElement.setAttribute('id', this.id)
    url.classList.add('pull-right')
    url.classList.add('tab-content')
    url.classList.add('tab-url')
    tabElement.addEventListener('click', () => {
      this.open()
    })
    return tabElement
  }

  select () {
    const element = document.getElementById(this.id)
    element.classList.add('selected')
    element.scrollIntoView(false)
    this.selected = true
  }

  unselect () {
    document.getElementById(this.id).classList.remove('selected')
    this.selected = false
  }

  open () {
    return getFirstWindow().then((w) =>
      browser.tabs.create({ url: this.url, windowId: w.id })
        .then(() => browser.windows.update(w.id, { focused: true }))
        .then(this.onOpen)
    )
  }
}
