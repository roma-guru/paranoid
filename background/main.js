const browser = chrome || browser;

browser.browserAction.onClicked.addListener(function() {
  console.info("paranoid extension reloading");
  browser.runtime.reload();
  browser.tabs.reload();
});
