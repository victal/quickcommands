function switchToTab(tabID) {
    browser.tabs.update(tabID, {
        active: true
    });
    closeUp()
}

function closeUp() {
    //Not quite a toothpaste
    let winId = browser.windows.WINDOW_ID_CURRENT;
    browser.windows.remove(winId);
}

function updateTabs(filterText) {
    let filterRegex = new RegExp(".*" + filterText + ".*", "i");
    return browser.tabs.query({
        currentWindow: false
    }).then((tabs) => {
        let currentTabs = [];
        for (let tab of tabs) {
            if (filterText) {
                if (!(filterRegex.test(tab.title) || filterRegex.test(tab.url))) {
                    continue
                }
            }
            let tabElement = new Tab(tab.id, tab.title);
            currentTabs.push(tabElement);
        }
        return currentTabs;
    });
}

function openTab(url) {
    getFirstWindow().then((w) => {
        browser.tabs.create({url: url, windowId:w.id }).then(() => {
            browser.windows.update(w.id, {focused: true});
            closeUp();
        });

    });

}

function updateHistoryTabs(filterText) {
    filterText = filterText ? filterText : "";
    let itemList = document.getElementById("historyList");
    browser.history.search({
        text: filterText,
        maxResults: 20
    }).then((items) => {
        let usedUrls = [];
        while (itemList.lastChild) {
            itemList.removeChild(itemList.lastChild);
        }
        let currentItems = document.createDocumentFragment();
        for (let item of items) {
            if (usedUrls.indexOf(item.url) === -1) {
                let itemElement = document.createElement("li");
                itemElement.setAttribute("data-item-url", item.url);
                itemElement.addEventListener("click", () => {
                    openTab(item.url);
                });
                itemElement.textContent = item.title;
                currentItems.appendChild(itemElement);
                usedUrls.concat(item.url);
            }
        }
        itemList.appendChild(currentItems);
    })
}

function getSelectedTabID() {
    let listEntry = document.querySelector("#tabs>.selected");
    return parseInt(listEntry.getAttribute("data-tab-id"));
}

function selectNextElement() {
    let selectedEntry = document.querySelector("#tabList>.selected");
    let nextElement = document.getElementById("tabList").querySelector(".selected + li");
    if (nextElement) {
        selectedEntry.classList.remove("selected");
        nextElement.classList.add("selected");
    }
}

function selectPreviousElement() {
    let tabList = document.getElementById("tabList");
    let selectedEntry = tabList.querySelector(".selected");
    let children = tabList.childNodes;
    for (let i = 1; i < children.length; i++) {
        if (children.item(i) === selectedEntry) {
            selectedEntry.classList.remove("selected");
            children.item(i - 1).classList.add("selected");
            return;
        }
    }
}

function setupInputFilter() {
    let searchInput = document.getElementById("search");
    //Use keydown instead of keyup to prevent the cursor from moving
    searchInput.addEventListener("keydown", (event) => {
        switch (event.key) {
            case "ArrowDown":
                selectNextElement();
                event.preventDefault();
                break;
            case "ArrowUp":
                selectPreviousElement();
                event.preventDefault();
                break;
            case "Enter":
                switchToTab(getSelectedTabID());
                break;
            case "ArrowLeft":
            case "ArrowRight":
                // ignored
                break;
            case "Escape":
                closeUp();
                break;
            default:
                console.debug(event.key);
                break;

        }
    });
    searchInput.addEventListener("keyup", (event) => {
        switch (event.key) {
            case "ArrowDown":
            case "ArrowUp":
            case "Enter":
            case "ArrowLeft":
            case "ArrowRight":
            case "Escape":
                // ignored
                break;
            default:
                updateTabs(searchInput.value);
                updateHistoryTabs(searchInput.value);
                break;
        }
    });
    searchInput.focus();
}

function getFirstWindow() {
    //TODO: Create if there is none
    return browser.windows.getAll().then((windows) => {
        return browser.windows.get(Math.min.apply(Math, windows.filter((w) => {
            return w.type === 'normal';
        }).map((w) => {
            return w.id;
        })));
    });
}

function reRender(tabList, historyList){
    let entryList = document.getElementById("entryList");
    let currentItems = document.createDocumentFragment();
    let tabSeparator = document.createElement("li");
    tabSeparator.textContent = "Tab";
    tabSeparator.classList.add("separator");
    currentItems.appendChild(tabSeparator);
    for (let tab of tabList) {
        currentItems.appendChild(tab.render());
    }
    tabSeparator = document.createElement("li");
    tabSeparator.textContent = "History";
    tabSeparator.classList.add("separator");
    currentItems.appendChild(tabSeparator);
    for (let tab of historyList) {
        currentItems.appendChild(tab.render());
    }
    entryList.appendChild(currentItems);
    if(tabList){
        tabList[0].select();
    }
}

function startUp() {
    // Fix for Fx57 bug where bundled page loaded using
    // browser.windows.create won't show contents unless resized.
    // See https://bugzilla.mozilla.org/show_bug.cgi?id=1402110
    browser.windows.getCurrent((win) => {
        browser.windows.update(win.id, {width:win.width+1});
    });
    let url = browser.extension.getURL("page/popup.html");
    browser.history.deleteUrl({url: url}).then(() => {
        console.debug("Extension page removed from history");
        setupInputFilter();
        let tabList = [];
        let historyList = [];
        updateTabs().then((tabs) => {
            tabList = tabs;
            reRender(tabList, historyList);
        });
        updateHistoryTabs();
    });

}

document.addEventListener("DOMContentLoaded", startUp);