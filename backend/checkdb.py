from app import app
from extensions import db
from sqlalchemy import inspect

with app.app_context():
    inspector = inspect(db.engine)
    print("Tabelas encontradas:")
    print(inspector.get_table_names())

    import sqlite3

conn = sqlite3.connect("instance/database.db")
cursor = conn.cursor()

cursor.execute("PRAGMA table_info(reacoes);")
colunas = cursor.fetchall()

print("Colunas da tabela reacoes:")
for coluna in colunas:
    print(coluna)

conn.close()