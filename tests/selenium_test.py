import os
from os import environ as env
from random import randint
from time import sleep

from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.alert import Alert
from selenium.webdriver.remote.command import Command

bro1 = webdriver.Firefox(firefox_binary=env["FIREFOX_BINARY"])
bro2 = webdriver.Firefox(firefox_binary=env["FIREFOX_BINARY"])

bro1.install_addon(os.path.abspath(
    f"../dist/paranoid-{env['ADDON_VERSION']}-an+fx.xpi"))
bro2.install_addon(os.path.abspath(
    f"../dist/paranoid-{env['ADDON_VERSION']}-an+fx.xpi"))

bro1.set_window_position(0, 0)
bro2.set_window_position(500, 100)

def login_vk(bro, login, password):
    bro.get("https://vk.com")
    user = bro.find_element_by_id("index_email")
    pwd = bro.find_element_by_id("index_pass")
    btn = bro.find_element_by_id("index_login_button")
    user.send_keys(login)
    pwd.send_keys(password)
    btn.click()

def accept_key(bro):
    Alert(bro).accept(); sleep(.1)
    key_alert = Alert(bro)
    my_key = key_alert.text
    key_alert.accept()
    return my_key

def send_message(bro):
    input = bro.find_element_by_class_name("paranoid-input")
    input.send_keys("Selenium test #" + str(randint(1, 100)))
    # hacking around Enter key
    script = """
        var input=document.querySelector('.paranoid-input');
        var event=new KeyboardEvent("keydown", {"code":"Enter"});
        input.dispatchEvent(event);
    """
    bro.execute_script(script)

def import_key(bro, user_id, val):
    key = f"paranoid:public:{user_id}"
    script = f"localStorage.setItem('{key}', `{val}`)"
    bro.execute_script(script)

def export_key(bro, user_id):
    key = f"paranoid:public:{user_id}"
    script = f"return localStorage.getItem('{key}')"
    return bro.execute_script(script)

try:
    user1_name = env["USER1_NAME"]
    user2_name = env["USER2_NAME"]
    login_vk(bro1, env["USER1_LOGIN"], env["USER1_PASSWORD"])
    login_vk(bro2, env["USER2_LOGIN"], env["USER2_PASSWORD"])
    sleep(3)
    bro1.get(f"https://vk.com/im?sel={env['USER2_ID']}")
    bro2.get(f"https://vk.com/im?sel={env['USER1_ID']}")
    sleep(1)

    bro1_key = accept_key(bro1)
    bro2_key = accept_key(bro2)
    import_key(bro1, user2_name, bro2_key)
    import_key(bro2, user1_name, bro1_key)

    print(user2_name, export_key(bro1, user2_name))
    print(user1_name, export_key(bro2, user1_name))

    bro1.refresh()
    bro2.refresh()
    sleep(3)
    send_message(bro1)
    send_message(bro2)

finally:
    sleep(10)
    bro1.quit()
    bro2.quit()

