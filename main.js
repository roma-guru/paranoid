const jsencrypt = require('jsencrypt');
const crypto = require('crypto-js');
const keys = require('./keys.js');

console.info("paranoid extension started");

const myself = new jsencrypt.JSEncrypt();
const companion = new jsencrypt.JSEncrypt();

// Determine interlocutors using picture links in UI
const my_id = document.querySelector('a.top_profile_link').attributes['href'].value.substr(1);
const his_id = document.querySelector('.im-page--aside-photo a').attributes.href.value.substr(1);
console.debug(my_id, his_id);

// Load keys upfront
myself.setPublicKey(keys.get_public(my_id));
myself.setPrivateKey(keys.get_private(my_id, 'passwd'));
companion.setPublicKey(keys.get_public(his_id));

// First - encrypt input messagebox on mouse leave
var old_input_content = "";
var inputbox = document.querySelector(".im-chat-input--text");

inputbox.onmouseout = function(e) {
  if (e.target.innerText) {
    console.debug(e.target.innerText);
    old_input_content = e.target.innerText;
    raw_text = old_input_content;
    console.log(raw_text.length)
    encrypted = companion.encrypt(raw_text)
    encrypted = encrypted + ' ' + myself.sign(crypto.MD5(encrypted),
      crypto.MD5, "md5");
    e.target.innerText = you.encrypt(encrypted);
  }
}
inputbox.onmouseover = inputbox.onchange = function(e) {
  if (old_input_content)
    e.target.innerText = old_input_content;
}

// Second - decrypt messages on mouse over
var message_hist = document.querySelector(".im-page-chat-contain");
var old_message_content = new Map();

message_hist.onmouseover = function(e) {
  const elem = e.target;
  if (elem.matches(".im-mess--text")) {
    const msgid = elem.parentNode.dataset["msgid"];
    old_message_content.set(msgid, elem.innerText);
    decrypted = myself.decrypt(elem.innerText);
    if (decrypted) {
      var words = decrypted.split(' ');
      var signature = atob(words[words.length - 1]);
      var raw_text = decrypted.slice(0, decrypted);
      if (companion.verify(raw_text, signature, crypto.MD5)) {
        console.log("signature verified");
        elem.innerText = raw_text;
      } else {
        console.log("signature failed");
      }
    }
  }
}
message_hist.onmouseout = function(e) {
  const elem = e.target;
  if (elem.matches(".im-mess--text")) {
    const msgid = elem.parentNode.dataset["msgid"];
    elem.innerText = old_message_content.get(msgid);
  }
}
