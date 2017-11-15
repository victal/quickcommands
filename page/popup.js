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
    let filterRegex = new RegExp(".*" + filterText + ".*", "i")
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

function setupInputFilter() {
    let searchInput = document.getElementById("search");
    searchInput.addEventListener("keyup", (event) => {
        switch (event.key) {
            case "ArrowDown":
                break; //TODO: Change selected tab
            case "ArrowUp":
                break; //TODO: Change selected tab
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