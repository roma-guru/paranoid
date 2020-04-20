const crypto = require('./crypto.js');
const ui = require('./ui.js'); 
const browser = chrome || browser;
console.info("paranoid extension started");

// TODO: run on each location update!
function init() {
  if (location.search.match(/sel/)) {
    // Only p2p messages
    console.info("preparing extension ui");
    const [my_id, interloc_id] = ui.getInterlocs();
    console.debug(my_id, interloc_id);
    crypto.preloadKeys(my_id, interloc_id);

    ui.injectMenu(my_id, interloc_id);
    ui.injectSendButton();
    ui.injectMessagesViewer();
  } else {
    console.info("you are not in private chat");
  }
}

init();
