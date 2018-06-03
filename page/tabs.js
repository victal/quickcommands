class TabList {
    constructor(title, search_fn){
        this.title = title;
        this.search = search_fn;
        this.tabs = [];
        this.selected = null;
        this.hidden = false;
    }
    update(filterText) {
        return this.search(filterText).then((results) => {
            this.tabs = results;
            this.selected = null;
            return results.length;
        })
    }
    selectFirst() {
        if(this.tabs.length > 0){
            this.tabs[0].select();
            this.selected = this.tabs[0];
            return true;
        }
        return false;
    }
    selectLast(){
        if(this.tabs.length > 0) {
            let ind = this.tabs.length - 1;
            this.tabs[ind].select();
            this.selected = this.tabs[ind];
            return true;
        }
        return false;
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
    get length() {
        return this.tabs.length;
    }
    toggleHidden() {
        this.hidden = !this.hidden;
        let chevron = this.separator.querySelector('.chevron');
        chevron.textContent = this.hidden ? '⧽': '⧼';
        if(this.hidden){
            for (const tab of this.tabs) {
                tab.hide();
            }
        }
        else {
            for (const tab of this.tabs) {
                tab.show();
            }
        }
    }

    renderSeparator() {
        this.separator = document.createElement("li");
        this.separator.classList.add("separator");
        let separatorName = document.createElement('span');
        separatorName.textContent = this.title;
        separatorName.classList.add('pull-left');
        let chevron = document.createElement('strong');
        chevron.textContent = this.hidden ? '⧽': '⧼';
        chevron.classList.add('pull-right')
        chevron.classList.add('chevron')
        chevron.classList.add('count')
        chevron.setAttribute('style', 'transform: rotate(90deg);');

        let count = document.createElement('span');
        count.textContent = this.length;
        count.classList.add('count');
        count.classList.add('pull-right');

        this.separator.appendChild(separatorName);
        this.separator.appendChild(chevron);
        this.separator.appendChild(count);
        return this.separator;
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

    hide() {
        let element = document.getElementById(this.tabID);
        element.classList.add('hidden');
    }

    show() {
        let element = document.getElementById(this.tabID);
        element.classList.remove('hidden');
    }

    select(){
        let element = document.getElementById(this.tabID);
        element.classList.add("selected");
        element.scrollIntoView(false);
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

class Link {
    constructor(url, title, id){
        this.url = url;
        this.title = title;
        this.id = id;
        this.selected = false;
    }

    render(){
        let tabElement = document.createElement("li");
        let title = document.createElement('span');
        title.textContent = this.title;
        title.classList.add('pull-left');
        title.classList.add('tab-content');
        let url = document.createElement('span');
        url.textContent = this.url;
        tabElement.appendChild(title);
        tabElement.appendChild(url);
        tabElement.setAttribute("id", this.id);
        url.classList.add('pull-right');
        url.classList.add('tab-content');
        url.classList.add('tab-url');
        tabElement.addEventListener("click", () => {
            this.open()
        });
        return tabElement;
    }

    select(){
        let element = document.getElementById(this.id);
        element.classList.add("selected");
        element.scrollIntoView(false);
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

    hide() {
        let element = document.getElementById(this.id);
        element.classList.add('hidden');
    }

    show() {
        let element = document.getElementById(this.id);
        element.classList.remove('hidden');
    }

}
