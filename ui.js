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
  const paranoid_html = `
    <label for="load-my-keys">load my keys</label>
    <input type="file" multiple id="load-my-keys"/>
    <label for="load-companion-keys">load his/her keys</label>
    <input type="file" multiple id="load-companion-keys"/>`;

  const node = document.createElement('div');
  node.innerHTML = paranoid_html;
  node.id = 'paranoid-ui';
  node.style = "position:absolute; top:0; left:0";
  node.querySelector('#load-my-keys').onchange = (e) => {
    for (file of e.target.files)
      file.text().then(key_val=>saveKey(my_id, key_val).
        catch(err=>console.error(err));
  }
  node.querySelector('#load-companion-keys').onchange = (e) => {
    for (file of e.target.files)
      file.text().then(key_val=>saveKey(companion_id, key_val).
        catch(err=>console.error(err));
  }

  document.body.appendChild(node);
}

module.exports = { injectUI };
