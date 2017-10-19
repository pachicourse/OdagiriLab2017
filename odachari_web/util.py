import hashlib
from datetime import datetime
from datetime import timedelta
from dateutil.relativedelta import relativedelta
import threading
import json
import asyncore, smtpd
import smtplib
import tornado.escape
import calendar
import math
from Crypto.Cipher import AES
from email.mime.text import MIMEText

config_file = open("config.json")
config = json.load(config_file)
config_file.close()

#ターゲットがスタートからエンドの期間内かどうかを計算する。

def do_hash(key,secret):
    return hashlib.sha256((key+secret).encode('utf-8')).hexdigest()
#print(do_hash("aaa","aaa"))

def encrypt(data,seed):
#    print(seed)
    if len(data.encode("UTF-8")) % 16 != 0:
        data += ( "<" * (16 - len(data.encode("UTF-8"))%16))

        
    secret_key = do_hash(seed,'>7#OYVs{SOk)),gb$Yq[mJ/xM>^lg]#7')[0:32]
    crypto = AES.new(secret_key)

    cipher_data = (crypto.encrypt(data))
    return cipher_data

def decrypt(data,seed):
    secret_key = do_hash(seed,'>7#OYVs{SOk)),gb$Yq[mJ/xM>^lg]#7')[0:32]
    crypto = AES.new(secret_key)
    original_data = crypto.decrypt(data)
    original_data = original_data.decode('utf-8').replace("<","")
    return original_data
#




def date_span(start_date, end_date):
    for n in range((end_date - start_date).days + 1):
        yield start_date + timedelta(n)

def month_span(start_date, end_date):
    yield start_date
    while(start_date.year != end_date.year or
          start_date.month != end_date.month):
        start_date = start_date + relativedelta(months=1)
        yield start_date


class SendMailThread(threading.Thread):
    def __init__(self,email,urlhash,mail_code=0):
        super(SendMailThread, self).__init__()
        self.email = email
        self.urlhash = urlhash
        self.mail_code = mail_code
        
    def run(self):
        me = config["mail"]["address"]
        passwd = config["mail"]["password"]
        you = self.email
        titletext = "小田切研究室"
        if self.mail_code == 0:
            body = """ようこそ小田切研究室へ。
            アカウントの本登録のために以下のリンクをクリックしてパスワードを登録してください。\n""" + "http://" + config["site"]["server_name"] + "/login?registid=" + self.urlhash
            
        if self.mail_code == 1:
            body = """パスワードの再設定を行います。
            以下のリンクをクリックしてパスワードを再設定してください。\n""" + "http://" + config["site"]["server_name"] + "/login?registid=" + self.urlhash

        msg = MIMEText(body)
        msg['Subject'] = titletext
        msg['From'] = me
        msg['To'] = you
        msg['Bcc'] = config["mail"]["admin_address"]
        s = smtplib.SMTP(config["mail"]["smtp"]["domain"],config["mail"]["smtp"]["port"])
        s.ehlo()
        s.starttls()
        s.ehlo()
        s.login(me, passwd)
        s.send_message(msg)
        s.close()
        

def escapeHtmlAndMongo(data):
    ans = tornado.escape.xhtml_escape(data)
    ans = ans.replace("$","")
    return ans

