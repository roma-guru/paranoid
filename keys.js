const aes = require('simple-aes-256');
const prefix = 'paranoid';

function check_key(user_id, key) {
  if (!key) console.error("empty key for", user_id);
  return !!key;
}

function fingerprint(key) {
  let res = 0;
  for (let c of key) {
    res += c.charCodeAt(0);
  }
  return res % 100000;
}

function get_public(user_id) {
  const key = `${prefix}:public:${user_id}`;
  let res = localStorage.getItem(key);
  if (!check_key(user_id, res)) return;
  console.info(`key fingerprint for ${user_id} is ${fingerprint(res)}`);
  console.debug(res);
  return res;
}

function get_private(user_id, password) {
  const key = `${prefix}:private:${user_id}`;
  let res = localStorage.getItem(key);
  if (!check_key(user_id, res)) return;
  res = Buffer.from(localStorage.getItem(key), 'base64');
  res = aes.decrypt(password, res).toString('ascii');
  return res;
}

function set_public(user_id, value) {
  const key = `${prefix}:public:${user_id}`;
  console.info(`set key ${key}`);
  localStorage.setItem(key, value.trim());
}

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
