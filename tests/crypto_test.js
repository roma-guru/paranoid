const crypto = require('../crypto.js');

describe("encryption/decryption", () => {
  let msg = "hello paranoid";

  it("encrypts/decrypts my message", () => {
    // enc1 - encrypted with interloc key, enc2 - with mine
    let [ enc1, enc2 ] = crypto.encryptMyMessage(msg);
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
    expect(crypto.verifyMyMessage(msg, sign)).toBeTrue();
  });
});

describe("keys manipulation", () => {
  let priv_key = `
-----BEGIN RSA PRIVATE KEY-----
MIIBOQIBAAJBALqFdGYLcFVmi6CjVOY58WwOHhQg9JZwa9YbzHmN6u8Gpbls8+i4
0bS1iHc72EjdNoZHP0kbtpooifzFpOhJ67kCAwEAAQJACWLh4qi8tG9+o0zU3ukX
jxp+xQCLjm6F3rZzacKMig6zgg4z7uWW2w1rYvO3heulUohEqRdhxQvEvs1/APDT
SQIhAO29aBBSmjHLS+fXuFSGQUCPRRXnkKAM24e2Xp7D9EirAiEAyNj0vo12g0v4
4pLaalP7zl0JXZfgQEehokn0UAFDJSsCIHhN/Lcl1bmU8thjpXfAaIzO81reT6Vu
XDkU5FTbPGb5AiBSf0LwLhz6yy7cqeNK/1oTpoVdSy/SV1nd1jCi2BHjZwIgB1LD
pNI5ITnX+EDJAXM4vJZldY7Og15i9o1jFdcnd8c=
-----END RSA PRIVATE KEY-----`.trim()
  let pub_key = `
-----BEGIN PUBLIC KEY-----
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBALqFdGYLcFVmi6CjVOY58WwOHhQg9JZw
a9YbzHmN6u8Gpbls8+i40bS1iHc72EjdNoZHP0kbtpooifzFpOhJ67kCAwEAAQ==
-----END PUBLIC KEY-----`.trim()

  it("update my keys", () => {
    crypto.setMyKeys(priv_key, pub_key);
    let [ res1, res2 ] = crypto.getMyKeys();
    expect(res1).toBe(priv_key);
    expect(res2).toBe(pub_key);
  })

  it("update interloc keys", () => {
    crypto.setInterlocKey(pub_key);
    let res = crypto.getInterlocKey();
    expect(res).toBe(pub_key);
  })
})
