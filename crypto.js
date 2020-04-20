const jsencrypt = require('jsencrypt');
const jshashes = require('jshashes');
const keys = require('./keys.js');

// RSA and hash objects
const myself = new jsencrypt.JSEncrypt();
const interloc = new jsencrypt.JSEncrypt();
const MD5 = new jshashes.MD5();

// Load keys upfront
function preloadKeys(my_id, interloc_id) {
  myself.setPublicKey(keys.get_public(my_id));
  myself.setPrivateKey(keys.get_private(my_id, 'passwd'));
  interloc.setPublicKey(keys.get_public(interloc_id));
}

function encryptMyMessage(raw_text) {
  return interloc.encrypt(raw_text);
}

function decryptInterlocMessage(encrypted) {
  return myself.decrypt(encrypted);
}

function signMyMessage(text) {
  return myself.sign(raw_text, MD5.hex, "md5");
}

function verifyInterlocSignature(raw_text, signature) {
  return interloc.verify(raw_text, signature, MD5.hex);
}

module.exports = {
  encryptMyMessage, signMyMessage, preloadKeys,
  decryptInterlocMessage, verifyInterlocSignature,
};
