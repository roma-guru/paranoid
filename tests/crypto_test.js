const crypto = require('../crypto.js');

describe("encryption/decryption", () => {
    it("works for my msg", () => {
        let msg = "hello there";
        let [ enc1, enc2 ] = crypto.encryptMyMessage(msg);
        expect(enc1).not.toBeNull();
        expect(enc1.length).toBeGreaterThan(msg.length);
        expect(enc1[enc1.length-1]).toBe('=');
        expect(enc2).not.toBeNull();
        expect(enc2.length).toBeGreaterThan(msg.length);
        expect(enc2[enc2.length-1]).toBe('=');

        let dec = crypto.decryptInterlocMessage(enc2);
        expect(dec).toBe(msg);
    });

});

describe("keys updates", () => {
    it("saves key for user_id", () => {

    });
});