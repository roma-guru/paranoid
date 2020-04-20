const browser = chrome || browser;

browser.browserAction.onClicked.addListener(() => {
  console.info("paranoid extension reloading");
  browser.runtime.reload();
  browser.tabs.reload();
});

browser.webNavigation.onHistoryStateUpdated.addListener(() => {

  function onError(error) {
    console.error(`Error: ${error}`);
  }

  function sendMessageToTabs(tabs) {
    for (let tab of tabs) {
      browser.tabs.sendMessage(
        tab.id,
        {type: "url_update"}
      );
    }
  }

  browser.tabs.query({
    currentWindow: true,
    active: true
  }).then(sendMessageToTabs).catch(onError);

});
