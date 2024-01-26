import dj_database_url
from django.db import connections

from exceptions import *

class connect_db:
    def __init__(self, database, **kwargs):
        #"postgres://avnadmin:AVNS_6f9Ep4BEB09VHqJNRgq@babyducts-babyducts.a.aivencloud.com:24489/inventory"
        self.database = database
        end = self.database.index(':')
        self.engine = self.database[:end]
        
        user_database_config = dj_database_url.parse(self.database)
        #set neccessary config details
        user_database_config['ATOMIC_REQUESTS'] = False
        user_database_config['TIME_ZONE'] = 'UTC'
        user_database_config['OPTIONS'] = {}
        user_database_config['AUTOCOMMIT'] = True
        
        #miscellanous data
        self.table_name = kwargs.get('table_name', None)
        
        #set user database config
        connections.databases['user_database'] = user_database_config
    
    def try_connect(self):
        try:
            with connections['user_database'].cursor() as cursor:
                pass
        except Exception as err:
            raise CannotConnect()
        
    def retrieve_data_from_table(self):
        try:
            with connections['user_database'].cursor() as cursor:
                cursor.execute(f"SELECT * from {self.table_name}")
                rows = cursor.fetchall()
                return rows
        except Exception as err:
            raise CannotConnect()
    
    def retrieve_table_names(self):
        ENGINES = {
            'postgres': self.retrieve_table_names_postgres(),
            'mysql': self.retrieve_table_names_mysql(),
            'oracle': self.retrieve_table_names_oracle(),
        }
        print(self.engine)
        return ENGINES[self.engine]
    
    def retrieve_table_names_postgres(self):
        #try:
        with connections['user_database'].cursor() as cursor:
            cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
            table_names = cursor.fetchall()
            data = []
            for table in table_names:
                print(table)
                data.append(table)
            return data
        #except Exception as err:
           ## print(err)
            #raise CannotConnect()
        
    def retrieve_table_names_mysql(self):
        try:
            with connections['user_database'].cursor() as cursor:
                cursor.execute("SHOW TABLES;")
                tables_name = cursor.fetchall()
                for tables in tables_name:
                    print(tables[0])
                return True
        except Exception as err:
            return False
        
    def retrieve_table_names_oracle(self):
        try:
            with connections['user_database'].cursor() as cursor:
                cursor.execute("SELECT table_name FROM all_tables;")
                tables_name = cursor.fetchall()
                for tables in tables_name:
                    print(tables[0])
                return True
        except Exception as err:
            raise CannotConnect()
        