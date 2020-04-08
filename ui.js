const keys = require('./keys.js');

function injectUI(my_id, companion_id) {
  const paranoid_html = `
    <label for="load-my-keys">load my keys</label>
    <input type="file" id="load-my-keys"/>
    <label for="load-companion-keys">load his/her keys</label>
    <input type="file" id="load-companion-keys"/>`;

  const node = document.createElement('div');
  node.innerHTML = paranoid_html;
  node.id = 'paranoid-ui';
  node.style = "position:absolute; top:0; left:0";
  node.querySelector('#load-my-keys').on
  document.body.appendChild(node);
}

module.exports = { injectUI };
