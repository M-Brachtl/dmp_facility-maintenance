# tento kód je určen ke správě a úpravám databáze při vývoji
# aplikace tento kód nevyužívá
if __name__ != "__main__":
    raise ImportError(f"Tento kód nepatří do aplikace a byl importován.\n__name__: {__name__}")

import sqlite3 as sql

connection = sql.connect("./database.db")
cursor = connection.cursor()

## zápisy revizí
# type je index revize v tabulce revision_types; datum je ve formátu DD/MM/RRRR
# cursor.execute("""CREATE TABLE IF NOT EXISTS revision_log (
#     id INTEGER PRIMARY KEY,
#     machine_id INTEGER,
#     date TEXT,
#     type INTEGER,
#     result TEXT,
#     notes TEXT,
#     machine_state TEXT
# );""")

# typy revizí (rule je v měsících)
# cursor.execute("""CREATE TABLE IF NOT EXISTS revision_types (
#     id INTEGER PRIMARY KEY,
#     name TEXT,
#     rule INTEGER
# );""")

# stroje
# cursor.execute("""CREATE TABLE IF NOT EXISTS machines (
#     id INTEGER PRIMARY KEY,
#     in_num TEXT,
#     name TEXT,
#     type TEXT,
#     location TEXT,
#     revision_array TEXT
# );""")

# people
# cursor.execute("""CREATE TABLE IF NOT EXISTS people (
#     id INTEGER PRIMARY KEY,
#     name TEXT,
#     rev_1 INTEGER,
#     rev_2 INTEGER
# );""")
