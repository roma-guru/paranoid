var jsencrypt = require('jsencrypt');

window.onload = function() {
    console.info("Paranoid extension started");
    var rsa1 = new jsencrypt.JSEncrypt();
    var rsa2 = new jsencrypt.JSEncrypt();
    console.debug(rsa1, rsa2);

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
    rsa2.setPrivateKey(roma_private);
    rsa2.setPublicKey(art_public);
    rsa2.setPrivateKey(art_private);

    var me=rsa1, you = rsa2;

    // First - encrypt input messagebox on mouse leave
    var old_input_content="";
    var inputbox = document.querySelector(".im-chat-input--text");

    inputbox.onmouseout = function(e) {
        if (e.target.innerText) {
            old_input_content = e.target.innerText;
            e.target.innerText=me.encrypt(e.target.innerText);
        }
    }
    inputbox.onmouseover = inputbox.onchange = function(e) {
        if (old_input_content) 
            e.target.innerText=old_input_content;
    }

    // Second - decrypt messages on mouse over
    var messages = document.querySelectorAll(".im-mess--text");
    var old_message_content = new Map();

    for (e of messages) {
        e.onmouseover = function(e) {
            const elem = e.target;
            const msgid = elem.parentNode.dataset["msgid"];
            old_message_content.set(msgid, elem.innerText);
            elem.innerText=you.decrypt(elem.innerText);
        }
        e.onmouseout = function(e) {
            const elem = e.target;
            const msgid = elem.parentNode.dataset["msgid"];
            elem.innerText=old_message_content.get(msgid);
        }
    }
}
