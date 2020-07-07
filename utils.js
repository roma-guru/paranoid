/* Utility module */
const keys = require('./keys.js');

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function saveKey(user_id, val) {
  if (val.indexOf("PUBLIC KEY") >= 0) {
    keys.set_public(user_id, val);
  } else {
    keys.set_private(user_id, val);
  }
}


module.exports = {
  sleep, saveKey
};
