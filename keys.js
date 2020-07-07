/* Core key storage module */

const aes = require('simple-aes-256');
const jshashes = require('jshashes');

const prefix = 'paranoid';

// Check key is valid
function check_key(user_id, key) {
  if (!key) console.error("empty key for", user_id);
  return !!key;
}

// Get easy to check fingerprint of the key
function fingerprint(key) {
  return jshashes.CRC32(key);
}

// Get public key of user
function get_public(user_id) {
  const key = `${prefix}:public:${user_id}`;
  let res = localStorage.getItem(key);
  if (!check_key(user_id, res)) return;
  console.info(`key fingerprint for ${user_id} is ${fingerprint(res)}`);
  console.debug(res);
  return res;
}

// Get private key of user
function get_private(user_id, password) {
  const key = `${prefix}:private:${user_id}`;
  let res = localStorage.getItem(key);
  if (!check_key(user_id, res)) return;
  res = Buffer.from(localStorage.getItem(key), 'base64');
  res = aes.decrypt(password, res).toString('ascii');
  return res;
}

// Set public key of user
function set_public(user_id, value) {
  const key = `${prefix}:public:${user_id}`;
  console.info(`set key ${key}`);
  localStorage.setItem(key, value.trim());
}

// Set private key of user
function set_private(user_id, value, password) {
  const key = `${prefix}:private:${user_id}`;
  console.info(`set key ${key}`);
  value = aes.encrypt(password, value);
  localStorage.setItem(key, value.toString('base64'));
}

module.exports = {
  get_public, get_private,
  set_public, set_private,
  fingerprint
}
