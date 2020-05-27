const {Builder, By, Key, until} = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const assert = require('assert');
const env = process.env;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
} 

async function login_vk(bro, login, password) {
    await bro.get("https://vk.com");
    let user = await bro.findElement(By.id("index_email"));
    let pwd = await bro.findElement(By.id("index_pass"));
    let btn = await bro.findElement(By.id("index_login_button"));
    await user.sendKeys(login);
    await pwd.sendKeys(password);
    await btn.click();
}

async function accept_key(bro) {
  await bro.switchTo().alert().accept();
  await bro.sleep(1000); // selenium can't wait alerts
  let key_alert = await bro.switchTo().alert();
  let my_key = await key_alert.getText();
  await key_alert.accept();
  return my_key;
}

async function send_message(bro, msg) {
  let selector = By.className("paranoid-input");
  await bro.wait(until.elementLocated(selector), 1000);
  let input = await bro.findElement(selector);
  await input.sendKeys(msg);
  await input.sendKeys(Key.ENTER);
  let script = `
    var input=document.querySelector('.paranoid-input');
    var event=new KeyboardEvent("keydown", {code:"Enter"});
    input.dispatchEvent(event);`;
  await bro.executeScript(script);
}

async function read_message(bro, index) {
  let selector = By.className("im-mess");
  await bro.wait(until.elementsLocated(selector), 1000);
  let messages = await bro.findElements(selector);
  let mess = messages[messages.length - 1 - index];
  let coords = await mess.getRect();
  let text = await mess.getText();
  console.debug(coords, text);
  let script = `
    var message_hist=document.querySelector(".im-page-chat-contain");
    var event=new MouseEvent("mouseover", ${JSON.stringify(coords)});
    message_hist.dispatchEvent(event);`;
  await bro.executeScript(script);
}

async function import_key(bro, user_id, val) {
  let key = `paranoid:public:${user_id}`;
  let script = `localStorage.setItem('${key}', \`${val}\`)`;
  await bro.executeScript(script);
}

async function export_key(bro, user_id) {
  let key = `paranoid:public:${user_id}`;
  let script = `return localStorage.getItem('${key}')`;
  return await bro.executeScript(script);
}

(async function() {
  let options = new firefox.Options().setBinary(env.FIREFOX_BINARY);
  let bro1 = await new Builder().forBrowser('firefox').setFirefoxOptions(options).build();
  let bro2 = await new Builder().forBrowser('firefox').setFirefoxOptions(options).build();

  try {
    await bro1.installAddon(`dist/paranoid-${env.ADDON_VERSION}-an+fx.xpi`);
    await bro2.installAddon(`dist/paranoid-${env.ADDON_VERSION}-an+fx.xpi`);
    await bro1.manage().window().setRect({x:0, y:0});
    await bro2.manage().window().setRect({x:700, y:0});

    await login_vk(bro1, env.USER1_LOGIN, env.USER1_PASSWORD);
    await login_vk(bro2, env.USER2_LOGIN, env.USER2_PASSWORD);

    await sleep(1000);
    await bro1.get(`https://vk.com/im?sel=${env.USER2_ID}`);
    await bro2.get(`https://vk.com/im?sel=${env.USER1_ID}`);
    
    await sleep(1000);
    let bro1_key = await accept_key(bro1);
    let bro2_key = await accept_key(bro2);
    await import_key(bro1, env.USER2_NAME, bro2_key);
    await import_key(bro2, env.USER1_NAME, bro1_key);
    assert(bro1_key == await export_key(bro2, env.USER1_NAME));
    assert(bro2_key == await export_key(bro1, env.USER2_NAME));

    // Have to refresh, because imported keys directly
    await bro1.navigate().refresh();
    await bro2.navigate().refresh();
    await send_message(bro1, "hello from bro1");
    await send_message(bro2, "hello from bro2");
    await sleep(1000);
    await read_message(bro1, 0);
    await read_message(bro2, 1);
  } finally {
    await sleep(20*1000);
    await bro1.quit();
    await bro2.quit();
  }
})()