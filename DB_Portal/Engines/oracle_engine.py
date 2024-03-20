from django.db import connections
from exceptions import *

class Oracle:
    # def __init__(self, database_url):
    #     self.database_url = database_url
    
    def retrieve_table_names(self):
        try:
            with connections['user_database'].cursor() as cursor:
                cursor.execute("SELECT table_name FROM all_tables;")
                table_names = cursor.fetchall()
                data = []
                for table in table_names:
                    data.append(table)
                    
                #whitelist table names
                self.whitelist_tables(data) 
                return data
            
        except Exception as err:
            raise CannotConnect()
        
    def retrieve_data_from_table(self):
        try:
            with connections['user_database'].cursor() as cursor:
                assert self.table_name in self.tables
                cursor.execute(f"SELECT * from {self.table_name}")
                rows = cursor.fetchall()
                return rows
        except Exception as err:
            #return Response({'detail':str(err)}, status=status.HTTP_403_FORBIDDEN)
            print(str(err))
            raise CannotConnect()
        
        #except AssertionError:
            #raise Table
    