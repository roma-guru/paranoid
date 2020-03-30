function importKey(isPrivate) {
  const user_id = document.querySelector("#user_id").value
  const key_val = document.querySelector("#key_value").value
  console.debug("Private?",isPrivate);

  browser.tabs.query({
    currentWindow: true, active:true}).then((tabs)=>{
      console.debug("sending key to tab", tabs[0].id);
      browser.tabs.sendMessage(tabs[0].id, {
        "type":"set_key",
        "is_private":isPrivate,
        "user_id":user_id,
        "key_val":key_val
      });
    });
}

function onReloadClick(e) {
    browser.runtime.reload();
    //browser.tabs.reload();
    console.info("paranoid reloaded");
}

function onImportPublicClick(e) {
  importKey(false);
}

function onImportPrivateClick(e) {
  importKey(true);
}

document.querySelector("#reload").onclick = onReloadClick;
document.querySelector("#import-public").onclick = onImportPublicClick;
document.querySelector("#import-private").onclick = onImportPrivateClick;

