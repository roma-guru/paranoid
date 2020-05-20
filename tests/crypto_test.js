const crypto = require('../crypto.js');

describe("encryption/decryption", () => {
  let msg = "hello paranoid";

  it("encrypts my message", () => {
    // enc1 - encrypted with interloc key, enc2 - with mine
    let [ enc1, enc2 ] = crypto.encryptMyMessage(msg);
    expect(enc1).not.toBeNull();
    // encrypted msg much longer
    expect(enc1.length).toBeGreaterThan(msg.length);
    expect(enc1[enc1.length-1]).toBe('=');
    expect(enc2).not.toBeNull();
    expect(enc2.length).toBeGreaterThan(msg.length);
    expect(enc2[enc2.length-1]).toBe('=');
  });

  it("decrypts my message", () => {
    // second should be decryptable by my pubkey
    let [ _, enc2 ] = crypto.encryptMyMessage(msg);
    let dec = crypto.decryptInterlocMessage(enc2);
    expect(dec).toBe(msg);
  });

});

describe("signing/verification", () => {
  let sign;
  let msg = "hello paranoid, sign me";

  it("signs my message", () => {
  });
});

describe("keys updates", () => {
  pub_key = `
-----BEGIN PUBLIC KEY-----
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKRGklGBpxSRzOJLKRmM+FJ/6ihjqXAt
dcGS1NE+viAlYV0WIJ3yF+yco0uhypNNSwefNrk7Xfg4G3iKQZ4+/78CAwEAAQ==
-----END PUBLIC KEY-----`
  priv_key = `
-----BEGIN RSA PRIVATE KEY-----
MIIBOQIBAAJBAOtBO24iYg2qRoCSbaxBB95wpjJGcyma9S4tc636RaqjJDl64oQ+
WqraV2BIqWiGkI5sdd0qz1R77irFKNlN9G8CAwEAAQJAVSdVhbX4XA3oWx2liRY4
7PFFlykdAlBOsxpMpwrSMMMO5UxTt/X4wsUmqcJ9vNzfAw40bEmAPQwDLRXhUh3T
cQIhAPprq8Jm5uQ0Vh3zgF0dagl8x0C1VNzAi9kxIKSzz7Y7AiEA8H8PUy19RNs/
NPgMGMJlX2vOskpesaY3WQP9wkjxM10CIFF85AF4lr2/wh4w9J5YSf8YWYZW+2xy
Q4/DisnNsVOtAiB74vgiAOzm64pD3wNcPce6v+5aKbVeDiG02Tl/O9QEgQIgYddf
DzOMOyvN6gzJf//NGGXLABr//n8rkNpOBBYTZ3s=
-----END RSA PRIVATE KEY----- `

  it("saves key for user_id", () => {
    crypto.saveKey("someuser", pub_key);
    expect(crypto.checkKey("someuser")).toBeTruthy();
  });
});
