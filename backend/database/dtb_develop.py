# tento kód je určen ke správě a úpravám databáze při vývoji
# aplikace tento kód nevyužívá
if __name__ != "__main__":
    raise ImportError(f"Tento kód nepatří do aplikace a byl importován.\n__name__: {__name__}")

import sqlite3 as sql
import os

connection = sql.connect(os.path.dirname(os.path.abspath(__file__)) + "\\database.db")
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

# people trained_rev je json a untrained_rev je list
# cursor.execute("""CREATE TABLE IF NOT EXISTS people (
#     id INTEGER PRIMARY KEY,
#     name TEXT,
#     trained_rev TEXT,
#     untrained_rev TEXT
# );""")

# kombinace stroj-revize-periodicita
# cursor.execute("""CREATE TABLE IF NOT EXISTS periodicity (
#     id INTEGER PRIMARY KEY,
#     revision_type INTEGER,
#     machine INTEGER,
#     rule INTEGER
# );""")

# cursor.execute("ALTER TABLE people RENAME TO people_old;")
# cursor.execute("UPDATE people SET untrained_rev='[1]' WHERE id=1;")
# cursor.execute("DELETE FROM revision_types WHERE id = 3;")

# cursor.execute("ALTER TABLE machines ADD COLUMN disposed BOOLEAN DEFAULT 0")
# cursor.execute("ALTER TABLE revision_log DROP COLUMN machine_state;")

cursor.execute("ALTER TABLE revision_types ADD COLUMN facility_activity BOOLEAN DEFAULT 0") # pořád v měsících
connection.commit()
