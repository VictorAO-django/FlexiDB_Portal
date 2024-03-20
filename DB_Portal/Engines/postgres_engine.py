from django.db import connections
from exceptions import *

class Postgres:
    def __init__(self, table=None):
        self.table = table
    
    def retrieve_table_names(self):
        try:
            with connections['user_database'].cursor() as cursor:
                query = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
                cursor.execute(query)
                table_names = cursor.fetchall()
                data = []
                for table in table_names:
                    data.append(table[0])

                return data
        except Exception as err:
            raise CannotConnect()
        
    def retrieve_data_from_table(self):
        try:
            assert self.table in self.retrieve_table_names(), f'{self.table} is not a valid table'
            
            with connections['user_database'].cursor() as cursor:
                cursor.execute(f"SELECT * from {self.table}")
                rows = cursor.fetchall()
                return rows
            
        except AssertionError as err:
            raise InvalidTable(detail=str(err))
            
        except Exception as err:
            print(str(err))
            raise CannotConnect()
    