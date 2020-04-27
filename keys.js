const prefix = 'paranoid';

function check_key(user_id, key) {
  if (!key) console.error("empty key for", user_id);
}

function get_public(user_id) {
  const key = `${prefix}:public:${user_id}`;
  const res = localStorage.getItem(key);
  check_key(user_id, res);
  console.debug(user_id, '\n', res);
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
  localStorage.setItem(key, value);
}

function set_private(user_id, value, password) {
  const key = `${prefix}:private:${user_id}`;
  console.info(`set key ${key}`);
  localStorage.setItem(key, value);
}

module.exports = {
  get_public, get_private,
  set_public, set_private
}
