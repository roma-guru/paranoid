const {Builder, By, Key, until} = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const Command = require('selenium-webdriver/lib/command').Command;
const assert = require('assert');
const path = require('path');
const colors = require('colors');
const env = process.env;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
} 

// Install unsigned extension
function install_webext(driver, extension) { 
  let cmd = new Command('moz-install-web-ext')
    .setParameter('path', path.resolve(extension))
    .setParameter('temporary', true);

  driver.getExecutor()
    .defineCommand(cmd.getName(), 'POST', '/session/:sessionId/moz/addon/install');

  return driver.execute(cmd);
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
  let script = `ui.test_send('${msg}');`
  await bro.executeScript(script);
}

async function read_message(bro) {
  let script = `return ui.test_read();`
  return await bro.executeScript(script);
}

async function import_key(bro, user_id, val) {
  let script = `keys.set_public('${user_id}', \`${val}\`)`;
  await bro.executeScript(script);
}

async function export_key(bro, user_id) {
  let script = `return keys.get_public('${user_id}')`;
  return await bro.executeScript(script);
}

(async function() {
  let options = new firefox.Options().setBinary(env.FIREFOX_BINARY);
  // env.MOZ_HEADLESS = '1';
  let bro1 = await new Builder().forBrowser('firefox').setFirefoxOptions(options).build();
  let bro2 = await new Builder().forBrowser('firefox').setFirefoxOptions(options).build();

  try {
    install_webext(bro1, `dist/paranoid-${env.ADDON_VERSION}.zip`);
    install_webext(bro2, `dist/paranoid-${env.ADDON_VERSION}.zip`);
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

    await send_message(bro1, "hello from bro1");
    await send_message(bro2, "hello from bro2");
    await sleep(1000);
    console.log(await read_message(bro1));
    console.log(await read_message(bro2));
    console.info("TEST PASS".green);
  } catch (err) {
    console.error("TEST FAIL".red);
    console.debug(err);
  } finally {
    await bro1.quit();
    await bro2.quit();
  }
})()