async function getPopupData() {
    const data = await browser.storage.local.get('popup');
    return Object.assign({}, data.popup);
}

async function openPopup() {
    // Prevent the popup from opening multiple times
    const winData = await getPopupData();
    if (winData.visible) return;
    console.info(`Quick Commands opening with data: `, winData);

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
        //Close window when focus is lost
        browser.windows.onFocusChanged.addListener(function(id) {
            if(id !== winData.id) {
                //browser.windows.remove(winData.id);
            }
        });
    });
    //Deletion from history is done on the page Javascript to ensure loading from history doesn't include it
}

browser.commands.onCommand.addListener((command) => {
    console.log("onCommand event received for message: ", command);
    openPopup();
});

async function updatePopupData(request, sender, sendResponse) {
    console.debug(`Saving window dimensions:`, request.popupWindow);
    const winData = await getPopupData();
    await browser.storage.local.set({
        popup: {
            id: winData.id,
            visible: false,
            width: request.popupWindow.width,
            height: request.popupWindow.height
        }
    });
    sendResponse({response: `Successfully saved window dimensions.`});
}

browser.browserAction.onClicked.addListener(openPopup);
browser.runtime.onMessage.addListener(updatePopupData);

// Reset popup visibility in case firefox was forcibly closed
getPopupData().then((data) => {
    data.visible = false;
    browser.storage.local.set({
        popup: data
    });
});
