function closeUp() {
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

function updateBookmarks(filterText) {
    filterText = filterText ? filterText : "";
    return browser.bookmarks.search({
        query: filterText
    }).then((items) => {
        let tabs = [];
        for(let item of items){
            if(item.type === 'bookmark' && item.title.trim().length > 0){
                //Limit bookmarks to http.* because of limitations on what we can open from an extension
                let allowedUrl = !item.url.toLowerCase().startsWith('place') && !item.url.toLowerCase().startsWith('about');
                if(allowedUrl){
                    tabs.push(new Link(item.url, item.title, "bookmark" + item.id));
                }
            }
        }
        return tabs;
    });
}

function updateHistoryTabs(filterText) {
    filterText = filterText ? filterText : "";
    return browser.history.search({
        text: filterText,
        startTime: 0,
        maxResults: 100
    }).then((items) => {
        let usedUrls = [];
        let historyTabs = [];
        for (let item of items) {
            //crude atttempt at not duplicating urls
            let allowedUrl = !item.url.toLowerCase().startsWith('place') && !item.url.toLowerCase().startsWith('about');
            let url = new URL(item.url);
            let cleanUrl = item.url.replace(url.hash, "");
            if (usedUrls.indexOf(cleanUrl) === -1 && item.title.trim().length > 0 && allowedUrl) {
                let link = new Link(cleanUrl, item.title, "history" + items.indexOf(item));
                historyTabs.push(link);
                usedUrls.concat(cleanUrl);
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
            tabSeparator.classList.add("separator");
            let separatorName = document.createElement('span');
            separatorName.textContent = tabList.title;
            separatorName.classList.add('pull-left');
            let count = document.createElement('span');
            count.textContent = tabList.length;
            count.classList.add('count');
            count.classList.add('pull-right');
            tabSeparator.appendChild(separatorName);
            tabSeparator.appendChild(count);
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
    return result.then(function (){
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
                new TabList("History", updateHistoryTabs),
                new TabList("Bookmarks", updateBookmarks)
            ];
            setupInputFilter(lists);
            updateAll(lists, null);
        });    
    });
}

document.addEventListener("DOMContentLoaded", startUp);
