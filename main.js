const crypto = require('./crypto.js');
const ui = require('./ui.js'); 
console.info("paranoid extension started");

function init() {
  if (location.search.match(/sel/)) {
    // Only p2p messages
    console.info("private chat, preparing extension ui");
    const [my_id, interloc_id] = ui.getInterlocs();
    console.info(my_id, interloc_id);
    crypto.preloadKeys(my_id, interloc_id);

    ui.injectMenu(my_id, interloc_id);
    ui.injectInput();
    ui.injectMessagesViewer();
  } else {
    console.info("you are not in private chat");
  }
}

init();
// Reload keys on chat switches
browser.runtime.onMessage.addListener(msg => {
  console.info("chat changed, reloading keys");
  if (msg.command == "init") init();
});