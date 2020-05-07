const fixedCommands = {
  //'Mute / Unmute Current Tab': () => browser.tabs.query, //save visible tab on start
  'Mute All Tabs': () => browser.tabs.query({audible: true, muted: false})
    .then(tabs => Promise.all(
      tabs.map(t => browser.tabs.update(t.id, {muted: true}))
    )),
  'Unmute All Tabs': () => browser.tabs.query({audible: true, muted: true})
    .then(tabs => Promise.all(
      tabs.map(t => browser.tabs.update(t.id, {muted: false}))
    )),
}

class Command {
  constructor(id, title, action, onOpen) {
    this.id = `mute-${id}`
    this.title = title
    this.action = action
    this.onOpen = onOpen
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

  render() {
    const tabElement = document.createElement('li')
    tabElement.setAttribute('id', this.id)
    tabElement.addEventListener('click', () => this.open())
    const title = document.createElement('span')
    title.textContent = this.title
    title.classList.add('pull-left')
    title.classList.add('tab-content')
    tabElement.appendChild(title)
    return tabElement
  }

  open() {
    return Promise.resolve(this.action()).then(this.onOpen)
  }
}

const muteTab = tabID => () => browser.tabs.update(tabID, {muted: true})
const unmuteTab = tabID => () => browser.tabs.update(tabID, {muted: false})

const getMuteCommands = async filterText => {
  const filterRegex = new RegExp('.*' + filterText + '.*', 'i')
  const audibleTabs = await browser.tabs.query({
    currentWindow: false,
    audible: true,
  })
  const mutedTabs = await browser.tabs.query({
    currentWindow: false,
    muted: true,
  })
  const commands = []
  //remove mute/unmute from filterText
  for (const tab of audibleTabs) {
    if (!tab.mutedInfo.muted) {
      const title = `Mute ${tab.title}`
      commands.push({
        title,
        url: tab.url,
        command: new Command(tab.id, title, muteTab(tab.id), closePopup)
      })
    }
  }
  for (const tab of mutedTabs) {
    const title = `Unmute ${tab.title}`
    commands.push({
      title,
      url: tab.url,
      command: new Command(tab.id, title, unmuteTab(tab.id), closePopup)
    })
  }
  if (filterText) {
    return commands.filter(cmd => filterRegex.test(cmd.title) || filterRegex.test(cmd.url)).map(cmd => cmd.command)
  }
  return commands.map(cmd => cmd.command)
}

const updateCommands = async filterText => {
  const muteCommands = await getMuteCommands(filterText)
  return [...muteCommands]
}

const commandList = new TabList('Commands', updateCommands)
