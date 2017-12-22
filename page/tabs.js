class TabList {
    constructor(title, search_fn){
        this.title = title;
        this.search = search_fn;
        this.tabs = [];
        this.selected = null;
    }
    update(filterText) {
        return this.search(filterText).then((results) => {
            this.tabs = results;
            this.selected = null;
            return results.length;
        })
    }
    selectFirst() {
        this.tabs[0].select();
        this.selected = this.tabs[0];
    }
    selectLast(){
        let ind = this.tabs.length - 1;
        this.tabs[ind].select();
        this.selected = this.tabs[ind];
    }
    selectNext(){
        let ind = this.tabs.indexOf(this.selected);
        if (ind === this.tabs.length - 1){
            return false;
        }
        this.selected.unselect();
        this.selected = this.tabs[ind + 1];
        this.selected.select();
        return true;
    }
    selectPrev(){
        let ind = this.tabs.indexOf(this.selected);
        if (ind === 0){
            return false;
        }
        this.selected.unselect();
        this.selected = this.tabs[ind - 1];
        this.selected.select();
        return true;
    }
    hasSelected() {
        return this.selected != null;
    }
    unselectAll(){
        if(this.selected != null){
            this.selected.unselect();
            this.selected = null;
        }
    }
}

class Tab {
    constructor(tabID, title){
        this.tabID = tabID;
        this.title = title;
        this.selected = false;
    }

    render(){
        let tabElement = document.createElement("li");
        tabElement.setAttribute("id", this.tabID);
        tabElement.addEventListener("click", () => {
            this.open()
        });
        tabElement.textContent = this.title;
        return tabElement;
    }

    select(){
        document.getElementById(this.tabID).classList.add("selected");
        this.selected = true;
    }

    unselect(){
        document.getElementById(this.tabID).classList.remove("selected");
        this.selected = false;
    }

    open() {
        browser.tabs.update(this.tabID, {
            active: true
        });
        closeUp()
    }
}

class HistoryLink {
    constructor(url, title, id){
        this.url = url;
        this.title = title;
        this.id = id;
        this.selected = false;
    }

    render(){
        let tabElement = document.createElement("li");
        tabElement.setAttribute("id", this.id);
        tabElement.addEventListener("click", () => {
            this.open()
        });
        tabElement.textContent = this.title;
        return tabElement;
    }

    select(){
        document.getElementById(this.id).classList.add("selected");
        this.selected = true;
    }

    unselect(){
        document.getElementById(this.id).classList.remove("selected");
        this.selected = false;
    }

    open() {
        getFirstWindow().then((w) => {
            browser.tabs.create({url:this.url, windowId:w.id }).then(() => {
                browser.windows.update(w.id, {focused: true});
                closeUp();
            });

        });
    }
}
