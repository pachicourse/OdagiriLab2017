import subprocess
import tornado.ioloop
import tornado.web
import json
import pymongo
import os
from util import *
import secrets
import tornado.escape
import tornado.options
from tornado.options import define, options
from db_access import DB_Access
import hashlib
from bson import ObjectId

import logging

class BaseHandler(tornado.web.RequestHandler):

    cookie_username = "username"
    api_session = ""
    def prepare(self):
        if self.current_user is not None:
            if self.current_user.decode('utf-8') != "admin":
                db.update_latest_use(self.current_user.decode('utf-8'))
        
    def get_current_user(self):
        username = self.get_secure_cookie(self.cookie_username)
        logging.debug('BaseHandler - username: %s' % username)
        if not username: return None
        return username

    def set_current_user(self, username):
        self.set_secure_cookie(self.cookie_username, username)

    def clear_current_user(self):
        self.clear_cookie(self.cookie_username)
    
    def create_api_session(self):
        self.api_session = self.get_cookie("username")
        return self.api_session

    def api_key_check(self,api_key):
        self.create_api_session()
        if self.api_session == api_key:
            return True
        else:
            return False
        
    def is_temp_user(self):
        if db.get_user(self.current_user.decode('utf-8')) is not None:
            if "regist_id" in db.get_user(self.current_user.decode('utf-8')):
                return True
        return False

    def write_error(self, status_code, exc_info=None, **kwargs):
        self.set_header('Content-Type', 'text/html; charset="utf-8"')
        self.render("top_redirect.html",params={"content":"不正なアクセスが発生しました。5秒後にトップページに遷移します。","redirect":""})


    
##########テンプレート表示用ハンドラ##########

#メイン画面
class MainHandler(BaseHandler):
    def get(self):
        if self.current_user is None:
            self.write("ログインしてください")
        else:
            params = {
                "title":"メインメニュー"
            }
            self.render("index.html", params=params)
#    新規ユーザの登録
class UserRegistHandler(BaseHandler):
    def get(self):
        self.render("regist.html",params={"target":"/regist","title":config['site']['title'],"submit":"仮登録"})
        
    def post(self):
        self.check_xsrf_cookie()
        email = escapeHtmlAndMongo(self.get_argument("email"))
        user = db.get_user(email)
        if user is None:
            hashed_temp_code = do_hash(email,config['site']['password_secret']+str(datetime.now()))
            db.add_temp_user(email,hashed_temp_code)
            mail = SendMailThread(email,hashed_temp_code)
            mail.start()
            self.render("message.html",params={"title":config['site']['title'],"message":"メールが送信されました。受信ボックスを確認してください。"})
        else:
            self.render("message.html",params={"title":config['site']['title'],"message":"このメールアドレスはすでに登録されています。"})

#パスワードの登録
class SetPasswordHandler(BaseHandler):
    @tornado.web.authenticated
    def post(self):
        self.check_xsrf_cookie()
        password = escapeHtmlAndMongo(self.get_argument("password"))
        password = do_hash(password,config['site']['password_secret'])
        username = self.current_user.decode('utf-8')
        before_user = db.get_duplicate_user(username)
#        元のユーザがあれば特定
        for data in before_user:
            if 'regist_id' not in data:
                before_user = data
                print(before_user['_id'])
                break
        db.remove_user(username)
        if '_id' in before_user:
            db.add_user(username,password,before_user['_id'])
            print("パスワードリセット")
        else:
            db.add_user(username,password)
            print("新規登録")
        self.redirect('/')


class PasswordResetHandler(BaseHandler):
    def get(self):
        if 'registid' in self.request.arguments:
            self.render('password_reset.html')
        else:
            self.render("regist.html",params={"target":"/password-reset","title":config['site']['title'],"submit":"メール送信"})
    def post(self):
        self.check_xsrf_cookie()
        email = escapeHtmlAndMongo(self.get_argument("email"))
        user = db.get_user(email)
#        if user is None:
        hashed_temp_code = do_hash(email,config['site']['password_secret']+str(datetime.now()))
        db.add_temp_user(email,hashed_temp_code)
        mail = SendMailThread(email,hashed_temp_code,1)
        mail.start()
        self.render("message.html",params={"message":"再設定用メールが送信されました。受信ボックスを確認してください。"})
#        else:
#            self.render("top_redirect.html",params={"content":"このメールアドレスはすでに登録されています。","redirect":"regist"})


#ログイン画面
class LoginHandler(BaseHandler):
    def get(self):
#        仮登録ユーザがアクセスした場合の処理
        if 'registid' in self.request.arguments:
            user = db.get_temp_user(escapeHtmlAndMongo(self.get_argument("registid")))
            if user is None:
                self.render("message.html",params={"message":"無効なアドレスです。もう一度メールアドレスの仮登録を行ってください。"})
            else:
                self.set_current_user(user["user_id"])
                self.create_api_session()
                self.render("set_password.html")
        else:
            self.render("login.html",params={"title":config['site']['title']})
        
    def post(self):
        self.check_xsrf_cookie()
        username = escapeHtmlAndMongo(self.get_argument("username"))
        password = escapeHtmlAndMongo(self.get_argument("password"))

        user = db.get_user(username)
        if user is None:
            self.render("message.html",params={"message":"IDが存在しません。"})
        elif user['password'] == do_hash(password,config['site']['password_secret']):
            self.set_current_user(username)
            self.create_api_session()
            self.redirect("/")
        else :
            self.render("message.html",params={"message":"パスワードが違います。"})

#ログアウト画面
class LogoutHandler(BaseHandler):
    def get(self):
        self.clear_current_user()
        self.redirect('/')




        
############ajax処理用API############
class AjaxSampleHandler(BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        if 'start' not in self.request.arguments:
            self.write("wrong param")
        elif 'end' not in self.request.arguments:
            self.write("wrong param")
        elif 'api_key' not in self.request.arguments:
            self.write("wrong param")

        elif self.api_key_check(escapeHtmlAndMongo(self.get_argument("api_key"))):
            self.write()
            self.finish()
        



if __name__ == "__main__":
    print("...server launched.")
#    subprocess.check_output('mongod --config /usr/local/etc/mongod.conf')
    
#    print("...DB bootded.")
    config_file = open("config.json")
    config = json.load(config_file)
    config_file.close()
    db = DB_Access()
    print("...database connected.")
    settings = dict(
            cookie_secret=config['site']['cookie_secret'],
            static_path=os.path.join(os.path.dirname(__file__), "static"),
            template_path=os.path.join(os.path.dirname(__file__), "templates"),
            login_url="/login",
            xsrf_cookies=True,
            autoescape="xhtml_escape",
            debug = config['site']['debug']
            )
    print("...config loaded.")
    application = tornado.web.Application(
        #ルーティング
        handlers=[
            (r"/password-reset", PasswordResetHandler),
            (r"/regist", UserRegistHandler),
            (r"/login", LoginHandler),
            (r"/logout", LogoutHandler),
            (r"/set-password", SetPasswordHandler),
            (r"/api/sample", AjaxSampleHandler),
            (r"/(?!(\?.*|#.*)).+", MainHandler),
            (r"/", MainHandler),
        ],
        **settings
    )
    application.listen(config['site']['port'])
    tornado.ioloop.IOLoop.instance().start()