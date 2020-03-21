var jsencrypt = require('jsencrypt');
var crypto = require('crypto-js');

console.info("Paranoid extension started");

var rsa1 = new jsencrypt.JSEncrypt();
var rsa2 = new jsencrypt.JSEncrypt();

// Keys
var roma_public=`
-----BEGIN PUBLIC KEY-----
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAPEwWLtlHhOIogTHi/RbWi3Vr4kKk3Cr
1DQDnVMW7UmvJPanjayZCGo9+3fIbR15y6zRG3mAp5ISlkNkfjG2ZTUCAwEAAQ==
-----END PUBLIC KEY-----`
var roma_private=`
-----BEGIN RSA PRIVATE KEY-----
MIIBOwIBAAJBAPEwWLtlHhOIogTHi/RbWi3Vr4kKk3Cr1DQDnVMW7UmvJPanjayZ
CGo9+3fIbR15y6zRG3mAp5ISlkNkfjG2ZTUCAwEAAQJAcDOlk8f+reeqN779BLha
w2fdOUuKO6g0F952mejYiqXgv14v/kcnsNjlpi72EZbZuEb7sdbXR29uvsJR2h+i
AQIhAPsHFBZddT10jksywfChEKmkRdGoHtvrDuLdCQweCGfFAiEA9fdgjbUvKYpn
jmvykSvCtxmIgDjPAtETgH9FElEQbrECIEgNWROuUaeJHAqzj/08jebTcwLhqbHf
/07YuO8Uc78tAiEAipU3rIACM5iMoj0F7W9HhRx4wS3AzSh5oXOTui88X/ECIQCN
V+viJGPx642pFzPDqDk1R/orJZqySYE76Ft2NZgZOg==
-----END RSA PRIVATE KEY-----`
var art_public=`
-----BEGIN PUBLIC KEY-----
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKRGklGBpxSRzOJLKRmM+FJ/6ihjqXAt
dcGS1NE+viAlYV0WIJ3yF+yco0uhypNNSwefNrk7Xfg4G3iKQZ4+/78CAwEAAQ==
-----END PUBLIC KEY----- `
var art_private=`
-----BEGIN RSA PRIVATE KEY-----
MIIBOgIBAAJBAKRGklGBpxSRzOJLKRmM+FJ/6ihjqXAtdcGS1NE+viAlYV0WIJ3y
F+yco0uhypNNSwefNrk7Xfg4G3iKQZ4+/78CAwEAAQJBAIoGIXoKDW/i8NpRfD7T
ivEGOJ+m3P47s+zoiZcluGkYpoxII17l2piioMfZxgRTzQ84q6bLeCJhNqi6P8T6
HEECIQDPdd43ACeiRFPzx4BKYNyOva6axEKpEDTd5Bt1Nlw9KwIhAMq2F6rzVEpM
GF1+ba6fceHNdxYG8JqCW5G9Hila3AW9AiB+EJHHukBbSkn5iPFcQR/FXV4MjdY0
BbUaYNKOl0nVoQIgQGBV4d+G/FVwQ3jcQmG2m/xRfnhTvu35QK5rvrxxNY0CIBvK
/EiXCHUtco6hGxHTr4UGOJSgKJObTZyUAsF2eTH/
-----END RSA PRIVATE KEY----- `

// Me and you
rsa1.setPublicKey(roma_public);
rsa1.setPrivateKey(roma_private);
rsa2.setPublicKey(art_public);
rsa2.setPrivateKey(art_private);

// Temporary hack, forgive me
var me, you;
if (location.search.indexOf('177304') > 0) {
    me = rsa1; you = rsa2;
} else {
    me = rsa2; you = rsa1;
}

// First - encrypt input messagebox on mouse leave
var old_input_content="";
var inputbox = document.querySelector(".im-chat-input--text");

inputbox.onmouseout = function(e) {
    if (e.target.innerText) {
        console.debug(e.target.innerText);
        old_input_content = e.target.innerText;
        raw_text = old_input_content;
        console.log(raw_text.length)
        encrypted = you.encrypt(raw_text)
        encrypted = encrypted + ' ' + me.sign(crypto.MD5(encrypted),
            crypto.MD5, "md5");
        e.target.innerText=you.encrypt(encrypted);
    }
}
inputbox.onmouseover = inputbox.onchange = function(e) {
    if (old_input_content) 
        e.target.innerText=old_input_content;
}

// Second - decrypt messages on mouse over
var message_hist = document.querySelector(".im-page-chat-contain");
var old_message_content = new Map();

message_hist.onmouseover = function(e) {
    const elem = e.target;
    if (elem.matches(".im-mess--text")) { 
        const msgid = elem.parentNode.dataset["msgid"];
        old_message_content.set(msgid, elem.innerText);
        decrypted = me.decrypt(elem.innerText);
        if (decrypted) {
            var words = decrypted.split(' ');
            var signature = atob(words[words.length-1]);
            var raw_text = decrypted.slice(0, decrypted);
            if (you.verify(raw_text, signature, crypto.MD5)) {
                console.log("signature verified");
                elem.innerText = raw_text;
            } else {
                console.log("signature failed");
            }
        }
    }
}
message_hist.onmouseout = function(e) {
    const elem = e.target;
    if (elem.matches(".im-mess--text")) { 
        const msgid = elem.parentNode.dataset["msgid"];
        elem.innerText=old_message_content.get(msgid);
    }
}
