const sendKey = (key_val) => {
  const user_id = document.querySelector("#user_id").value;
  const isPrivate = key_val.indexOf("PRIVATE KEY") >- 1;
  const type = isPrivate? "private":"public";
  console.info(`importing ${type} for ${user_id}`);

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

document.querySelector("#reload").onclick = (e) => {
    browser.runtime.reload();
    //browser.tabs.reload();
    console.info("paranoid reloaded");
};

document.querySelector("#import_key").onchange = (e) => {
  for (file of e.target.files) 
    file.text().then(sendKey).catch((err)=>console.error(err));
}

