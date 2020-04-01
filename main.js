const jsencrypt = require('jsencrypt');
const keys = require('./keys.js');
const openpgp = require('./openpgp.min.js');

(async () => {
    const key = await openpgp.generateKey({
        userIds: [{ name: 'Jon Smith'}], // you can pass multiple user IDs
        rsaBits: 521,                                              // RSA key size
    });
    console.debug(key);
})();

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

const initSendingButton = () => {

  let  originalButton = document.querySelector('.im-send-btn.im-chat-input--send');
  originalButton.setAttribute('style','display:none;');
  let newBtn = document.createElement('BUTTON');
  newBtn.setAttribute('class',originalButton.getAttribute('class'));
  newBtn.setAttribute('aria-label',"Отправить");
  newBtn.setAttribute('data-tttype',"2");
  originalButton.parentElement.appendChild(newBtn);

  newBtn.onclick = () => {

    let inputbox = document.querySelector(".im-chat-input--text");
    console.debug(inputbox.innerText);
    old_input_content = inputbox.innerText;
    raw_text = old_input_content;
    encrypted = companion.encrypt(raw_text);
    //encrypted = encrypted + ' ' + myself.sign(crypto.MD5(encrypted),
    //crypto.MD5, "md5");

    //TODO we need to check if the input is really changed so we can send encrypted data
    //Sometimes inputbox doesn't have anough time to change and the original text is sent
    inputbox.innerText = btoa(encrypted);
    inputbox.innerText = btoa(encrypted);
    originalButton.click()
  }

};
initSendingButton()

// Second - decrypt messages on mouse over
var message_hist = document.querySelector(".im-page-chat-contain");
var old_message_content = new Map();

message_hist.onmouseover = function(e) {
  const elem = e.target;
  if (elem.matches(".im-mess--text")) {
    const msgid = elem.parentNode.dataset["msgid"];
    old_message_content.set(msgid, elem.innerText);
    decrypted = myself.decrypt(atob(elem.innerText));
    if (decrypted) {
        elem.innerText = decrypted;
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

// Listen for keys updates
console.debug("set msg listenener");
browser.runtime.onMessage.addListener((m) => {
  if (m.type=='set_key') {
    const {user_id, key_val, is_private} = m;
    console.info("setting key for", user_id);
    console.debug("private:", is_private);
    if (user_id && key_val) {
      if (is_private)
        keys.set_private(user_id, key_val, '');
      else
        keys.set_public(user_id, key_val);
    } 
  }
});

