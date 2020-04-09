const jsencrypt = require('jsencrypt');
const jshashes = require('jshashes');
const keys = require('./keys.js');
const ui = require('./ui.js'); 

console.info("paranoid extension started");

const myself = new jsencrypt.JSEncrypt();
const companion = new jsencrypt.JSEncrypt();
const MD5 = new jshashes.MD5();

// Determine interlocutors using picture links in UI
const my_id = document.querySelector('a.top_profile_link').attributes['href'].value.substr(1);
const his_id = document.querySelector('.im-page--aside-photo a').attributes.href.value.substr(1);
console.debug(my_id, his_id);

// Inject plugin UI
console.info("preparing extension ui");
ui.injectUI(my_id, his_id);

// Load keys upfront
myself.setPublicKey(keys.get_public(my_id));
myself.setPrivateKey(keys.get_private(my_id, 'passwd'));
companion.setPublicKey(keys.get_public(his_id));

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

const initSendingButton = () => {
  let  old_input_content = "";
  let  originalButton = document.querySelector('.im-send-btn.im-chat-input--send');
  originalButton.setAttribute('style','display:none;');
  let newBtn = document.createElement('button');
  newBtn.setAttribute('class', "im-send-btn im-chat-input--send");
  originalButton.parentElement.appendChild(newBtn);

  newBtn.onclick = () => {
    let inputbox = document.querySelector(".im-chat-input--text");
    console.debug(inputbox.innerText);
    old_input_content = inputbox.innerText;
    raw_text = old_input_content;
    encrypted = companion.encrypt(raw_text);
    compound = btoa(encrypted) + ' ' + 
      btoa(myself.sign(raw_text, MD5.raw, "md5"));

    inputbox.innerText = compound;
    sleep(300).then(()=>originalButton.click());
  }
};
initSendingButton()

// Second - decrypt messages on mouse over
var message_hist = document.querySelector(".im-page-chat-contain");
var old_message_content = new Map();

message_hist.onmouseover = (e) => {
  const elem = e.target;
  if (elem.matches(".im-mess--text")) {
    // prevent blicking on message height changes
    if (!elem.style.minHeight)
      elem.style.minHeight = elem.getBoundingClientRect().height + "px";

    const msgid = elem.parentNode.dataset["msgid"];
    old_message_content.set(msgid, elem.innerText);
    const parts = elem.innerText.split(' ');
    const decrypted = myself.decrypt(atob(parts[0]));
    const signature = parts[1];
    if (decrypted)
        elem.innerText = decrypted;
    else
      console.warn("can't decrypt");

    if (decrypted && signature) {
        const verified = 
          companion.verify(decrypted, atob(signature), MD5.raw);
        if (verified) 
          elem.innerText += ' ✓';
        else
          elem.innerText += ' ✗';
    } else {
      console.warn("no signature for message");
    }

  }
}
message_hist.onmouseout = (e) => {
  const elem = e.target;
  if (elem.matches(".im-mess--text")) {
    const msgid = elem.parentNode.dataset["msgid"];
    elem.innerText = old_message_content.get(msgid);
  }
}
