const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM(`<html></html>`,
    {url: 'http://localhost/'});
['localStorage', 'window', 'navigator'].forEach(key => {
    global[key] = window[key] });
