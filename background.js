function openPopup() {
    let url = browser.extension.getURL("page/popup.html");
    browser.windows.create({
       "type": "detached_panel",
        "url": url,
        width: 599,
        height: 500
    });
    //Deletion from history is done on the page Javascript to ensure loading from history doesn't include it
}


browser.commands.onCommand.addListener((command) => {
    console.log("onCommand event received for message: ", command);
    openPopup();
});