/* Web extension entrypoint */

const crypto = require('./crypto.js');
const ui = require('./ui.js'); 
const keys = require('./keys.js');

// for test automation (firefox only)
window.wrappedJSObject.keys = cloneInto(keys, window,
  {cloneFunctions: true});
window.wrappedJSObject.ui = cloneInto(ui, window,
  {cloneFunctions: true});

let passwd = prompt("enter your priv key password");

function init() {
  if (ui.checkChatUrl()) {
    // Only private messages!
    console.info("private chat, preparing extension ui");
    const [my_id, interloc_id] = ui.getInterlocs();
    console.info(my_id, interloc_id);

    // Ensure your keys
    if (!keys.get_public(my_id) && confirm("keys not found, generate?")) {
      // First start, no keys yet
      console.warn("copy your new pub key!");
      let [priv_key, pub_key] = crypto.getMyKeys();
      alert(pub_key); console.info(pub_key);
      keys.set_public(my_id, pub_key);
      keys.set_private(my_id, priv_key, passwd);
    } else {
      // Second start, already have keys
      console.info("keys found, asking password");
      crypto.setMyKeys(keys.get_private(my_id, passwd), keys.get_public(my_id));
    }

    // Ensure your buddy's key
    if (!keys.get_public(interloc_id)) {
      console.warn("your buddy's key not imported yet");
    } else {
      crypto.setInterlocKey(keys.get_public(interloc_id));
    }

    // Inject extension UI parts
    ui.injectMenu(my_id, interloc_id);
    ui.injectInput();
    ui.injectMessagesViewer();
  } else {
    console.debug("you are not in private chat");
  }
}

console.info("paranoid extension started"); init();

// Reload keys on chat switches
browser.runtime.onMessage.addListener(msg => {
  console.debug("location changed, reloading keys");
  if (msg.command == "init") init();
});
