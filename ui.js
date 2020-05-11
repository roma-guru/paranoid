const utils = require('./utils.js');
const crypto = require('./crypto.js');

function injectInput() {
  // already done
  if (document.querySelector('.paranoid-input')) {
    console.debug("input already injected");
    return;
  }

  let new_inputbox = document.createElement('input');
  let panel = document.querySelector(".im-chat-input");

  panel.style = "display: none";
  new_inputbox.className = "paranoid-input";
  new_inputbox.style = "width:100%;font-size:13pt;color:white;background-color:#4a76a8";
  new_inputbox.maxLength = 50;
  new_inputbox.placeholder = "Type here, hit ⏎ to send";
  panel.parentElement.appendChild(new_inputbox);

  let orig_button = document.querySelector('.im-send-btn.im-chat-input--send');
  let orig_inputbox = document.querySelector(".im-chat-input--text");

  new_inputbox.onkeydown = (e) => {
    // send on enter
    if (e.code != "Enter") return;
    const [my_id, interloc_id] = getInterlocs();
    const raw_text = new_inputbox.value;
    if (!crypto.checkBothKeys(my_id)) {
      alert("can't encrypt - missing some of your keys"); return;
    }
    if (!crypto.checkKey(interloc_id)) {
      alert("can't encrypt - missing your dude's pubkey"); return;
    }
    if (raw_text) {
      let [encrypted1, encrypted2] = crypto.encryptMyMessage(raw_text);
      let signature = crypto.signMyMessage(raw_text);
      let compound = `${encrypted1} ${signature} ${encrypted2}`;

      orig_inputbox.innerText = compound;
      new_inputbox.value = "";
      // give time to update DOM
      utils.sleep(100).then(()=>orig_button.click());
    }
  }
}

function injectMenu(my_id, interloc_id) {
  // drop old one, with old keys
  const old_menu = document.querySelector('.paranoid-menu');
  if (old_menu) {
    console.debug("reinjecting menu cause interloc change");
    old_menu.remove();
  }

  const new_html = `
  <div class="paranoid-menu">
    <div class="ui_actions_menu_sep"></div>
    <a tabindex="0" class="ui_actions_menu_item im-action
      im-action_invite">Загрузить мои приватный/публичный ключи</a>
      <input type="file" class="ui_actions_menu_item" id="load-my-keys" multiple/>
    <a tabindex="0" class="ui_actions_menu_item im-action 
      im-action_invite">Загрузить публичный ключ собеседника</a>
      <input type="file" class="ui_actions_menu_item" id="load-companion-keys"/>
  </div>
  `;
  const menu = document.querySelector('div._im_dialog_action_wrapper div._ui_menu_wrap div._ui_menu');
  menu.innerHTML += new_html;

  menu.querySelector('#load-my-keys').onchange = (e) => {
    for (file of e.target.files)
      file.text().then(key_val=>{
        crypto.saveKey(my_id, key_val);
        crypto.reloadMyKeys(my_id);
      }).catch(err=>console.error(err));
  }
  menu.querySelector('#load-companion-keys').onchange = (e) => {
    for (file of e.target.files)
      file.text().then(key_val=>{
        crypto.saveKey(interloc_id, key_val);
        crypto.reloadInterlocKeys(interloc_id);
      }).catch(err=>console.error(err));
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
      const [my_id, interloc_id] = getInterlocs();
      const msg_author = getMsgAuthor(msgid);
      console.debug("author is ", msg_author);

      old_message_content.set(msgid, elem.innerText);
      const parts = elem.innerText.split(' ');
      const encrypted = msg_author == my_id? parts[2] : parts[0];
      const decrypted = crypto.decryptInterlocMessage(encrypted);
      const signature = parts[1];
      if (decrypted)
        elem.innerText = decrypted;
      else
        console.warn("can't decrypt message");

      if (decrypted && signature) {
          const verified = msg_author == my_id || crypto.verifyInterlocSignature(decrypted, signature);
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

function getMsgAuthor(msgid) {
  msgid = String(msgid);
  const msg_elem = document.querySelector(`.im-mess[data-msgid="${msgid}"]`);
  const link_elem = msg_elem.parentElement.parentElement.querySelector('a.im-mess-stack--lnk');
  return link_elem.attributes['href'].value.substr(1);
}

module.exports = { 
  injectMenu, injectInput,
  injectMessagesViewer, getInterlocs,
};
