from dotenv import load_dotenv
load_dotenv()
import os
import pyodbc
def connect_db():
    try:
        host = os.getenv('HOST')
        user = os.getenv('USER')
        password = os.getenv('PASSWORD')
        database = os.getenv('DATABASE')
        cnxn = pyodbc.connect(
            f'DRIVER={{ODBC Driver 17 for SQL Server}};'
            f'Server={host};'
            f'Database={database};'
            f'UID={user};'
            f'PWD={password};'
            'TrustServerCertificate=yes;'
            'Encrypt=no;'
        )
        print("Conexión exitosa")
        return cnxn
    except pyodbc.Error as e:
        print(f"Error de conexión a la base de datos: {e}")
        raise
#connect_db()