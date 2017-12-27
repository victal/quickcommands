function closeUp() {
    //Not quite a toothpaste
    let url = browser.extension.getURL("page/popup.html");
    browser.history.deleteUrl({url: url + "#"}).then(() => {
       let winId = browser.windows.WINDOW_ID_CURRENT;
        browser.windows.remove(winId);
    });
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
                    continue;
                }
            }
            let tabElement = new Tab(tab.id, tab.title);
            currentTabs.push(tabElement);
        }
        return currentTabs;
    });
}

function updateHistoryTabs(filterText) {
    filterText = filterText ? filterText : "";
    return browser.history.search({
        text: filterText,
        maxResults: 20
    }).then((items) => {
        let usedUrls = [];
        let historyTabs = [];
        for (let item of items) {
            if (usedUrls.indexOf(item.url) === -1) {
                let link = new HistoryLink(item.url, item.title, "history" + items.indexOf(item));
                historyTabs.push(link);
                usedUrls.concat(item.url);
            }
        }
        return historyTabs;
    });
}

function setupInputFilter(lists) {
    let searchInput = document.getElementById("search");
    //Use keydown instead of keyup to prevent the cursor from moving
    searchInput.addEventListener("keydown", (event) => {
        switch (event.key) {
            case "ArrowDown":
                selectNext(lists);
                event.preventDefault();
                break;
            case "ArrowUp":
                selectPrevious(lists);
                event.preventDefault();
                break;
            case "Enter":
                openSelectedTab(lists);
                break;
            case "ArrowLeft":
            case "ArrowRight":
                // ignored
                break;
            case "Escape":
                closeUp();
                break;
            default:
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
                updateAll(lists, searchInput.value);
                break;
        }
    });
    searchInput.focus();
    searchInput.addEventListener("blur", (ev) => {
        setTimeout(function() {
            searchInput.focus();
        }, 10);
    });
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

function reRender(lists){
    let entryList = document.getElementById("entryList");
    while (entryList.lastChild) {
        entryList.removeChild(entryList.lastChild);
    }

    let currentItems = document.createDocumentFragment();
    for (const tabList of lists) {
        if(tabList.length > 0){
            let tabSeparator = document.createElement("li");
            tabSeparator.textContent = tabList.title;
            tabSeparator.classList.add("separator");
            currentItems.appendChild(tabSeparator);
            for (let tab of tabList.tabs) {
                currentItems.appendChild(tab.render());
            }
        }
    }
    entryList.appendChild(currentItems);
    if(lists.length > 0){
        for(const tabList of lists){
            if(tabList.length > 0 ){
                tabList.selectFirst();
                return;
            }
        }
    }
}

function openSelectedTab(lists) {
    for (const tabList of lists) {
        if(tabList.hasSelected()){
            tabList.selected.open();
        }
    }
}

function selectNext(lists){
    for (const tabList of lists) {
        if(tabList.hasSelected()){
            let selected = tabList.selectNext();
            if(!selected){
                let ind = lists.indexOf(tabList);
                tabList.unselectAll();
                let selected = false, nextInd = ind + 1;
                while(!selected){
                   selected = lists[nextInd % lists.length].selectFirst();
                   nextInd += 1; 
                }
            }
            return;
        }
    }
}

function selectPrevious(lists){
    for (const tabList of lists) {
        if(tabList.hasSelected()){
            let selected = tabList.selectPrev();
            if(!selected){
                let ind = lists.indexOf(tabList);
                tabList.unselectAll();
                let selected = false, nextInd = ind - 1 + lists.length;
                while(!selected){
                    selected = lists[nextInd % lists.length].selectLast();
                    nextInd -= 1;
                }
            }
            return;
        }
    }
}

function updateAll(lists, filterText){
    let result = Promise.resolve();
    lists.forEach((l) => {
        result = result.then(function (){
            return l.update(filterText);
        });
    });
    result.then(function (){
        return reRender(lists);
    });
}

function updatePageStyle() {
    if(browser.theme){
        console.log("Your browser supports the theme API!");
        return browser.theme.getCurrent().then((theme) => {
            console.log(theme.colors.accentcolor);
            console.log(theme.colors.textcolor);
            return Promise.resolve();
        });
    }
    return Promise.resolve();
}

function startUp() {
    // Fix for Fx57 bug where bundled page loaded using
    // browser.windows.create won't show contents unless resized.
    // See https://bugzilla.mozilla.org/show_bug.cgi?id=1402110
    browser.windows.getCurrent((win) => {
        browser.windows.update(win.id, {width:win.width+1});
    });
    let url = browser.extension.getURL("page/popup.html");
    updatePageStyle().then(() => {
        return browser.history.deleteUrl({url: url}).then(() => {
            console.debug("Extension page removed from history");
            let lists = [
                new TabList("Tabs", updateTabs),
                new TabList("History", updateHistoryTabs)
            ];

            updateAll(lists, null);
            setupInputFilter(lists);
        });    
    });
}

document.addEventListener("DOMContentLoaded", startUp);
