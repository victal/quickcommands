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
    let tabList = document.getElementById("tabList");
    let filterRegex = new RegExp(".*" + filterText + ".*", "i");
    browser.tabs.query({
        currentWindow: false
    }).then((tabs) => {
        while (tabList.lastChild) {
            tabList.removeChild(tabList.lastChild)
        }
        let currentTabs = document.createDocumentFragment();
        for (let tab of tabs) {
            if (filterText) {
                if (!(filterRegex.test(tab.title) || filterRegex.test(tab.url))) {
                    continue
                }
            }
            let tabElement = document.createElement("li");
            tabElement.setAttribute("data-tab-id", tab.id);
            tabElement.addEventListener("click", () => {
                switchToTab(tab.id);
            });
            tabElement.textContent = tab.title;
            currentTabs.appendChild(tabElement)
        }
        tabList.appendChild(currentTabs);
        if (tabList.firstElementChild) {
            tabList.firstElementChild.classList.add("selected");
        }
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
    let selectedEntry = document.querySelector("#tabs>.selected");
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
                updateTabs(searchInput.value);
                updateHistoryTabs(searchInput.value);
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

function startUp() {
    let url = browser.extension.getURL("page/popup.html");
    browser.history.deleteUrl({url: url}).then(() => {
        console.debug("Extension page removed from history")
        setupInputFilter();
        updateTabs();
        updateHistoryTabs();
    });

}

document.addEventListener("DOMContentLoaded", startUp);