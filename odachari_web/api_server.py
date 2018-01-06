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

            
class PostPracticeHandler(BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        term = self.get_argument("term")
        self.write('{"speed":123,"cadence":125}'*(int)(term))
        self.finish()
    @tornado.web.asynchronous
    def post(self):
        request = json.loads(self.request.body.decode('utf-8'))
        print(request)
        username = escapeHtmlAndMongo(request["user"]["username"])
        password = escapeHtmlAndMongo(request["user"]["password"])
#        
        user = db.get_user(username)
        if user is None:
            self.write('{"message":"IDが存在しません。"}')
        elif user['password'] == do_hash(password,config['site']['password_secret']):
            self.write("success")
            db.add_practice_data(username,request["data"])
            
        else :
            self.write('{"message":"パスワードが違います。"}')


        self.finish()



if __name__ == "__main__":
    print("...server launched.")
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
#            xsrf_cookies=True,
            autoescape="xhtml_escape",
            debug = config['site']['debug']
            )
    print("...config loaded.")
    application = tornado.web.Application(
        #ルーティング
        handlers=[
            (r"/api/sample", AjaxSampleHandler),
            (r"/api/post-practice-data", PostPracticeHandler)
        ],
        **settings
    )
    application.listen(config['api']['port'])
    tornado.ioloop.IOLoop.instance().start()