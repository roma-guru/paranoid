const browser = chrome || browser;

browser.browserAction.onClicked.addListener(() => {
  console.info("paranoid extension reloading");
  browser.runtime.reload();
});

browser.tabs.onUpdated.addListener((tabId, e) => {
  console.debug(`url change in tab ${tabId} to ${e.url}`);
  browser.tabs.sendMessage(tabId, {command:"init"});
},
{
  urls: browser.runtime.getManifest().content_scripts[0].matches
});