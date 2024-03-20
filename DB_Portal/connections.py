import dj_database_url
from django.db import connections
from rest_framework.response import Response

from core.models import DatabaseConfig
from exceptions import *

from Engines.postgres_engine import Postgres
from Engines.mysql_engine import Mysql
from Engines.oracle_engine import Oracle


class connect_db:
    def __init__(self, database, engine=None, table=None, **kwargs):
        ENGINES = {
            'postgres': Postgres,
            'mysql': Mysql,
            'oracle': Oracle
        }
        
        self.database = database
        self.engine = ENGINES[engine]
        self.table = table
        
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
        
    def retrieve_table_names(self):
        return self.engine().retrieve_table_names()
    
    def retrieve_data_from_table(self):
        return self.engine(table=self.table).retrieve_data_from_table()