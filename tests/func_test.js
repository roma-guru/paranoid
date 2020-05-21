const {Builder, By, Key, until} = require('selenium-webdriver');
const env = process.env;

async function login_vk(bro, login, password) {
    await bro.get("https://vk.com");
    user = await bro.find_element_by_id("index_email");
    pwd = await bro.find_element_by_id("index_pass");
    btn = await bro.find_element_by_id("index_login_button");
    await user.send_keys(login);
    await pwd.send_keys(password);
    await btn.click();
}

async function accept_key(bro) {
}

async function send_message(bro) {
}

(async function main() {
  let bro1 = await new Builder().forBrowser('firefox', {
    firefox_binary:env.FIREFOX_BINARY
  }).build();
  try {
    await login_vk(bro1, 'test', 'test');
  } finally {
    await bro1.quit();
  }
})();
