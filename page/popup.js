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
    let tabList = document.getElementById("tabs");
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

function getSelectedTabID() {
    let listEntry = document.querySelector("#tabs>.selected");
    return parseInt(listEntry.getAttribute("data-tab-id"));
}

function selectNextElement() {
    let selectedEntry = document.querySelector("#tabs>.selected");
    let nextElement = document.getElementById("tabs").querySelector(".selected + li");
    if (nextElement) {
        selectedEntry.classList.remove("selected");
        nextElement.classList.add("selected");
    }
}

function selectPreviousElement() {
    let tabList = document.getElementById("tabs");
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
    searchInput.addEventListener("keyup", (event) => {
        switch (event.key) {
            case "ArrowDown":
                selectNextElement();
                break;
            case "ArrowUp":
                selectPreviousElement();
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
                updateTabs(searchInput.value)
        }
    });
    searchInput.focus();
}

function startUp() {
    setupInputFilter();
    updateTabs()
}

document.addEventListener("DOMContentLoaded", startUp);