async function openPopup() {
    // Prevent the popup from opening multiple times
    let data = await browser.storage.local.get('popup');
    if (data && data.popup && data.popup.visible) return;

    let url = browser.extension.getURL("page/popup.html");
    browser.windows.create({
        "type": "detached_panel",
        "url": url,
        width: 599,
        height: 500
    }).then(async function(win){
        // Update the popup data to reflect its visibility status and window ID
        await browser.storage.local.set({popup: {id: win.id, visible: true}});
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
    let data = await browser.storage.local.get('popup');
    if (data.popup.id === winId) {
        await browser.storage.local.set({popup: {id: winId, visible: false}});
    }
});

browser.browserAction.onClicked.addListener(openPopup);
