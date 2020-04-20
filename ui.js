const keys = require('./keys.js');
const utils = require('./utils.js');
const crypto = require('./crypto.js');

function saveKey(user_id, key_val) {
  const isPrivate = key_val.indexOf("PRIVATE KEY") >- 1;
  const type = isPrivate? "private":"public";
  console.info(`importing ${type} for ${user_id}`);

  if (isPrivate) {
    keys.set_private(user_id, key_val, "passwprd");
  } else {
    keys.set_public(user_id, key_val);
  }
}

function injectSendButton() {
  let  originalButton = document.querySelector('.im-send-btn.im-chat-input--send');
  originalButton.setAttribute('style','display:none;');
  let newBtn = document.createElement('button');
  newBtn.setAttribute('class', "im-send-btn im-chat-input--send");
  originalButton.parentElement.appendChild(newBtn);

  newBtn.onclick = () => {
    let inputbox = document.querySelector(".im-chat-input--text");
    raw_text = inputbox.innerText;
    encrypted = crypto.encryptMyMessage(raw_text);
    signature = crypto.signMyMessage(raw_text);
    compound = `${encrypted} ${signature}`;

    inputbox.innerText = compound;
    // give time to update DOM
    utils.sleep(100).then(()=>originalButton.click());
  }
}

function injectMenu(my_id, companion_id) {
  const new_html = `
  <div class="ui_actions_menu_sep"></div>
  <a tabindex="0" class="ui_actions_menu_item im-action
    im-action_invite">Загрузить мои приватный/публичный ключи</a>
    <input type="file" class="ui_actions_menu_item" id="load-my-keys" multiple/>
  <a tabindex="0" class="ui_actions_menu_item im-action 
    im-action_invite">Загрузить публичный ключ собеседника</a>
    <input type="file" class="ui_actions_menu_item" id="load-companion-keys"/>
  `;
  const menu = document.querySelector('div._im_dialog_action_wrapper div._ui_menu_wrap div._ui_menu');
  menu.innerHTML += new_html;

  menu.querySelector('#load-my-keys').onchange = (e) => {
    for (file of e.target.files)
      file.text().then(key_val=>saveKey(my_id, key_val)).catch(
        err=>console.error(err));
  }
  menu.querySelector('#load-companion-keys').onchange = (e) => {
    for (file of e.target.files)
      file.text().then(key_val=>saveKey(companion_id, key_val)).catch(
        err=>console.error(err));
  }

}

function injectMessagesViewer() {
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
      const decrypted = crypto.decryptInterlocMessage(parts[0]);
      const signature = parts[1];
      if (decrypted)
        elem.innerText = decrypted;
      else
        console.warn("can't decrypt");

      if (decrypted && signature) {
          const verified = crypto.verifyInterlocSignature(
            decrypted, signature);
          elem.innerText += verified? ' ✓':' ✗';
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
}

function getInterlocs() {
  // Determine interlocutors using picture links in UI
  const my_id = document.querySelector('a.top_profile_link').attributes['href'].value.substr(1);
  const interloc_id = document.querySelector('.im-page--aside-photo a').attributes.href.value.substr(1);
  return [my_id, interloc_id];
}

module.exports = { 
  injectMenu, injectSendButton,
  injectMessagesViewer, getInterlocs,
};
