const jsencrypt = require('jsencrypt');
const jshashes = require('jshashes');
const keys = require('./keys.js');

// RSA and hash objects
const myself = new jsencrypt.JSEncrypt({default_key_size:512});
const interloc = new jsencrypt.JSEncrypt();
const MD5 = new jshashes.MD5();


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

function checkKey(user_id) {
  return keys.get_public(user_id);
}

function checkBothKeys(user_id) {
  return keys.get_public(user_id) && keys.get_private(user_id);
}

function genMyKeys(my_id) {
  keys.set_public(my_id, myself.getPublicKey());
  keys.set_private(my_id, myself.getPrivateKey(), 'passwd');
  return myself.getPublicKey();
}

function reloadMyKeys(my_id) {
    myself.setPublicKey(keys.get_public(my_id));
    myself.setPrivateKey(keys.get_private(my_id, 'passwd'));
}

function reloadInterlocKeys(interloc_id) {
  interloc.setPublicKey(keys.get_public(interloc_id));
}

function encryptMyMessage(raw_text) {
  return [interloc.encrypt(raw_text), myself.encrypt(raw_text)];
}

function decryptInterlocMessage(encrypted) {
  return myself.decrypt(encrypted);
}

function signMyMessage(text) {
  return myself.sign(text, MD5.hex, "md5");
}

function verifyInterlocSignature(raw_text, signature) {
  return interloc.verify(raw_text, signature, MD5.hex);
}

module.exports = {
  encryptMyMessage, signMyMessage,
  reloadInterlocKeys, reloadMyKeys, genMyKeys,
  decryptInterlocMessage, verifyInterlocSignature,
  saveKey, checkKey, checkBothKeys,
};
