browser.browserAction.onClicked.addListener(function() {
  browser.runtime.reload();
  browser.tabs.reload();
});
