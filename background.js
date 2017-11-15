function openPopup() {
    let url = browser.extension.getURL("page/popup.html");
    browser.windows.create({
        "type": "detached_panel",
        "url": url,
        width: 600,
        height: 500
    }).then(() => {
        browser.history.deleteUrl({url: url});
    }).catch((e) => {
        throw e
    });
}


browser.commands.onCommand.addListener((command) => {
    console.log("onCommand event received for message: ", command);
    openPopup();
});