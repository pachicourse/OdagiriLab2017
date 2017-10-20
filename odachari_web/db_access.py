import pymongo
from functools import singledispatch
from datetime import datetime
from util import *
from bson import ObjectId
import calendar

class DB_Access:
    def __init__(self):
        self.client = pymongo.MongoClient('localhost', 27017)
        self.db = self.client.uriage_db
        self.user = self.db.user_collection
        
    def add_user(self,user_id,password,object_id=None):
        if object_id is None:
            self.user.insert_one({"user_id":user_id,"password":password})
        else:
            self.user.insert_one({"user_id":user_id,"password":password,"_id":object_id})
    
    def update_latest_use(self,user_id):
        user = self.user.find_one({"user_id":user_id})
        user["latest_use"] = datetime.now()
        self.user.update({'user_id':user_id},user)
        
    def remove_user(self,user_id):
        self.user.remove({'user_id':user_id})

        #仮ユーザの登録
    def add_temp_user(self,user_id,password):
        try:
            self.user.create_index("ttl", expireAfterSeconds=86400)
        except:
            print("すでにTTLが設定されています。")
        self.user.insert_one({"user_id":user_id,"regist_id":password,"ttl":datetime.utcnow()})
        
    def get_user(self,user_id):
        return self.user.find_one({"user_id":user_id})
    
    def get_duplicate_user(self,user_id):
        return self.user.find({"user_id":user_id})
    
    def get_temp_user(self,regist_id):
        return self.user.find_one({"regist_id":regist_id})

db = DB_Access()
#db.get_fixed_cost_by_term("hoge")
#print(db.get_cost_by_term("todo","2015-01","2019-10"))