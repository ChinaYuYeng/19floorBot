import sqlite3
import win32crypt
import os
 
def get_chrome_cookies(url):
    # os.system('copy "C:\\Users\\dell\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Cookies" D:\\python-chrome-cookies')
    urls = []
    for u in url.split(','):
        urls.append("host_key='"+u+"'")
    conn = sqlite3.connect("C:\\Users\\dell\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Cookies")
    ret_list = []
    ret_dict = {}
    for row in conn.execute("select host_key, name, path, value, encrypted_value from cookies where "+' or '.join(urls)):
        # if row[0] != url:
        #     continue
        ret = win32crypt.CryptUnprotectData(row[4], None, None, None, 0)
        ret_list.append((row[1], ret[1]))
        ret_dict[row[1]] = ret[1].decode()
    conn.close()
    # os.system('del "D:\\python-chrome-cookies"')
    print(ret_dict)
    # return ret_dict
# get_chrome_cookies('.baidu.com,www.baidu.com')