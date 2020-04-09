const keys = require('./keys.js');

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

function injectUI(my_id, companion_id) {
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

module.exports = { injectUI };
