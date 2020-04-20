const browser = chrome || browser;

browser.browserAction.onClicked.addListener(() => {
  console.info("paranoid extension reloading");
  browser.runtime.reload();
  browser.tabs.reload();
});
