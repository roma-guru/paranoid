const crypto = require('./crypto.js');
const ui = require('./ui.js'); 
const keys = require('./keys.js');
console.info("paranoid extension started");

function init() {
  if (location.pathname.match(/im/) && location.search.match(/sel/)) {
    // Only p2p messages
    console.info("private chat, preparing extension ui");
    const [my_id, interloc_id] = ui.getInterlocs();
    console.info(my_id, interloc_id);

    if (!keys.get_public(my_id) && confirm("keys not found, generate?")) {
      // TODO: use vk natime MessageBox
      console.warn("copy your new public key!");
      const pub_key = crypto.genMyKeys(my_id);
      alert(pub_key); console.info(pub_key);
    }
    crypto.reloadMyKeys(my_id);
    crypto.reloadInterlocKeys(interloc_id);

    ui.injectMenu(my_id, interloc_id);
    ui.injectInput();
    ui.injectMessagesViewer();
  } else {
    console.debug("you are not in private chat");
  }
}

init();
// Reload keys on chat switches
browser.runtime.onMessage.addListener(msg => {
  console.debug("location changed, reloading keys");
  if (msg.command == "init") init();
});