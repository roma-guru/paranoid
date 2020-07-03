const jsencrypt = require('jsencrypt');
const jshashes = require('jshashes');
const keys = require('./keys.js');

// RSA and hash objects
// By default JSEncrypt generates pub/priv keys
const myself = new jsencrypt.JSEncrypt({default_key_size:512});
const interloc = new jsencrypt.JSEncrypt();
const MD5 = new jshashes.MD5();

// Generate and save keys for me, returns only pub!
function getMyKeys() {
  return [myself.getPrivateKey(), myself.getPublicKey()];
}

// Update my keys
function setMyKeys(priv_key, pub_key) {
  myself.setPublicKey(pub_key);
  myself.setPrivateKey(priv_key);
}

// Update zer keys
function setInterlocKey(pub_key) {
  interloc.setPublicKey(pub_key);
}

// Return their key
function getInterlocKey() {
  return interloc.getPublicKey();
}

// Encrypt my message with his/her pub key 
// AND with mine to be able to read myself,
// returns 2 encrypted messages
function encryptMyMessage(raw_text) {
  return [interloc.encrypt(raw_text), myself.encrypt(raw_text)];
}

// Decrypt incoming message
function decryptInterlocMessage(encrypted) {
  return myself.decrypt(encrypted);
}

// Sign outcoming message
function signMyMessage(text) {
  return myself.sign(text, MD5.hex, "md5");
}

// Verify outcoming message, be paranoid
function verifyMyMessage(raw_text, signature) {
  return myself.verify(raw_text, signature, MD5.hex);
}

// Verify incoming message
function verifyInterlocSignature(raw_text, signature) {
  return interloc.verify(raw_text, signature, MD5.hex);
}

module.exports = {
  encryptMyMessage, signMyMessage, verifyMyMessage,
  decryptInterlocMessage, verifyInterlocSignature,
  setMyKeys, setInterlocKey,
  getMyKeys, getInterlocKey,
};
