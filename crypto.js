const jsencrypt = require('jsencrypt');
const jshashes = require('jshashes');
const keys = require('./keys.js');

// RSA and hash objects
const myself = new jsencrypt.JSEncrypt({default_key_size:512});
const interloc = new jsencrypt.JSEncrypt();
const MD5 = new jshashes.MD5();

// Load keys upfront
function preloadKeys(my_id, interloc_id) {
  if (keys.get_public(my_id)) {
    // load keys from storage
    myself.setPublicKey(keys.get_public(my_id));
    myself.setPrivateKey(keys.get_private(my_id, 'passwd'));
  } else {
    // or save new keys
    keys.set_public(my_id, myself.getPublicKey());
    keys.set_private(my_id, myself.getPrivateKey(), 'passwd');
    alert("new keypair generated");
    console.warn("copy your public key!")
    console.info(myself.getPublicKey());
  }
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
