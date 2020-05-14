const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM(`<html></html>`,
    {url: 'http://localhost/'});
Object.keys(window).forEach(key => {
    global[key] = window[key] });
