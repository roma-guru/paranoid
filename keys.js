const prefix = 'paranoid';

function check_key(user_id, key) {
  if (!key) console.error("empty key for", user_id);
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
  const res = localStorage.getItem(key);
  check_key(user_id, res);
  console.info(`key fingerprint for ${user_id} is ${fingerprint(res)}`);
  console.debug(res);
  return res;
}

function get_private(user_id, password) {
  const key = `${prefix}:private:${user_id}`;
  const res = localStorage.getItem(key);
  // TODO: key decipher
  check_key(user_id, res);
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
  localStorage.setItem(key, value);
}

module.exports = {
  get_public, get_private,
  set_public, set_private,
  fingerprint
}
