const crypto = require('../crypto.js');

describe("encryption/decryption", () => {
  let msg = "hello paranoid";

  it("encrypts/decrypts my message", () => {
    // enc1 - encrypted with interloc key, enc2 - with mine
    let [ enc1, enc2 ] = crypto.encryptMyMessage(msg);
    console.debug(enc1);
    expect(enc1).not.toBeNull();
    expect(enc2).not.toBeNull();

    let dec = crypto.decryptInterlocMessage(enc2);
    expect(dec).toBe(msg);
  });

});

describe("signing/verification", () => {
  let msg = "hello paranoid, sign me";

  it("signs/verifies my message", () => {
    let sign = crypto.signMyMessage(msg);
    expect(sign).not.toBeNull();
    expect(sign[sign.length-1]).toBe('=');

    expect(crypto.verifyMyMessage(msg, sign)).toBeTrue();
  });
});

describe("keys updates", () => {
  let pub_key = 'PUBLIC KEY';
  let priv_key = 'PRIVATE KEY';

  it("saves keys for user_id", () => {
    crypto.saveKey("someuser", pub_key);
    crypto.saveKey("someuser", priv_key);
    expect(crypto.checkKey("someuser")).toBeTruthy();
    expect(crypto.checkBothKeys("someuser")).toBeTruthy();
  });

  it("generates and saves keys", () => {
    crypto.genMyKeys("my_id");
    expect(localStorage["paranoid:private:my_id"]).toBeTruthy();
    expect(localStorage["paranoid:public:my_id"]).toBeTruthy();
  });
});
