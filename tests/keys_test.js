const keys = require('../keys.js');

describe("util funcs", () => {
  it("fingerprints", () => {
    expect(keys.fingerprint("test")).toBe(448);
  });
})

describe("keys storage", () => {
  let pub_key = 'PUBLIC KEY';
  let priv_key = 'PRIVATE KEY';

  it("operates private keys", () => {
    keys.set_private("my_id", priv_key);
    expect(localStorage["paranoid:private:my_id"]).toBe(priv_key);
    expect(keys.get_private("my_id")).toBe(priv_key);
  });

  it("operates public keys", () => {
    keys.set_public("my_id", pub_key);
    expect(localStorage["paranoid:public:my_id"]).toBe(pub_key);
    expect(keys.get_public("my_id")).toBe(pub_key);
  });

});
