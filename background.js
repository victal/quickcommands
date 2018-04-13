async function getPopupData() {
    const data = await browser.storage.local.get('popup');
    return Object.assign({}, data.popup);
};

async function openPopup() {
    // Prevent the popup from opening multiple times
    const winData = await getPopupData();
    if (winData.visible) return;

    const url = browser.extension.getURL("page/popup.html");
    browser.windows.create({
        "type": "detached_panel",
        "url": url,
        width: winData.width || 599,
        height: winData.height || 500
    }).then(async function(winData){
        // Update the popup data to reflect its visibility status and window ID
        await browser.storage.local.set({
            popup: {
                id: winData.id,
                visible: true,
                width: winData.width,
                height: winData.height
            }
        });
    });
    //Deletion from history is done on the page Javascript to ensure loading from history doesn't include it
}

browser.commands.onCommand.addListener((command) => {
    console.log("onCommand event received for message: ", command);
    openPopup();
});

browser.windows.onRemoved.addListener(async (winId) => {
    // Listen for when our specific popup window is closed,
    // then update its data to reflect that
    const winData = await getPopupData();
    if (winData.id === winId) {
        await browser.storage.local.set({
            popup: {
                id: winData.id,
                visible: false,
                width: winData.width,
                height: winData.height
            }
        });
    }
});

browser.browserAction.onClicked.addListener(openPopup);
