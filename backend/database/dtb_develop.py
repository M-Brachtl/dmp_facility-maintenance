# tento kód je určen ke správě a úpravám databáze při vývoji
# aplikace tento kód nevyužívá
if __name__ != "__main__":
    raise ImportError(f"Tento kód nepatří do aplikace a byl importován.\n__name__: {__name__}")

import sqlite3 as sql
import os

connection = sql.connect(os.path.dirname(os.path.abspath(__file__)) + "\\database.db")
cursor = connection.cursor()

## zápisy revizí
# type je index revize v tabulce revision_types; datum je ve formátu rrrr-mm-dd
# cursor.execute("""CREATE TABLE IF NOT EXISTS revision_log (
#     id INTEGER PRIMARY KEY,
#     machine_id INTEGER,
#     date TEXT,
#     type INTEGER,
#     result TEXT, # bez závady/malá závada/velká závada
#     notes TEXT
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

# people trained_rev je json a untrained_rev je list !! SLOUPCE JSOU ODEBRANÉ
# cursor.execute("""CREATE TABLE IF NOT EXISTS people (
#     id INTEGER PRIMARY KEY,
#     name TEXT
# );""")

# kombinace stroj-revize-periodicita
# cursor.execute("""CREATE TABLE IF NOT EXISTS periodicity (
#     id INTEGER PRIMARY KEY,
#     revision_type INTEGER,
#     machine INTEGER,
#     rule INTEGER
# );""")

# training_log, historie školení
# cursor.execute("""CREATE TABLE IF NOT EXISTS training_log (
#     id INTEGER PRIMARY KEY,
#     revision_type INTEGER,
#     person INTEGER,
#     date TEXT,
#     expiration_date TEXT
# );""")

# cursor.execute("ALTER TABLE people RENAME TO people_old;")
# cursor.execute("UPDATE people SET untrained_rev='[1]' WHERE id=1;")
# cursor.execute("DELETE FROM revision_types WHERE id = 3;")

# cursor.execute("ALTER TABLE machines ADD COLUMN disposed BOOLEAN DEFAULT 0")
# cursor.execute("ALTER TABLE revision_log DROP COLUMN machine_state;")

# cursor.execute("ALTER TABLE revision_types ADD COLUMN facility_activity BOOLEAN DEFAULT 0") # pořád v měsících
# cursor.execute("ALTER TABLE people DROP COLUMN trained_rev;")
# cursor.execute("ALTER TABLE people DROP COLUMN untrained_rev;")

# cursor.execute("UPDATE revision_log SET date = '2025-10-29' WHERE id = 1;")

# testing command:
# SELECT title, name, date FROM actions JOIN people ON person_id=people.id WHERE date = (
#  SELECT MAX(a2.date) FROM actions AS a2 WHERE a2.title=actions.title AND a2.person_id=actions.person_id
#) ORDER BY date DESC;

# cursor.execute("""SELECT m.id, m.in_num, m.name, m.type, m.location, m.revision_array, m.disposed FROM machines AS m
#     JOIN revision_log ON m.id=log.machine_id""")

# cursor.execute("""INSERT INTO revision_log (machine_id, date, type, result, notes) VALUES
# -- Stroj 1 – revize 1
# (1, '2025-01-12', 1, 'bez závady', 'TEST - Vše proběhlo hladce.'),
# (1, '2025-03-08', 1, 'malá závada', 'TEST - Opotřebený filtr – vyměněno.'),

# -- Stroj 1 – revize 2
# (1, '2025-04-15', 2, 'bez závady', 'TEST - Parametry v normě.'),
# (1, '2025-06-21', 2, 'velká závada', 'TEST - Chyba řídící jednotky – nutný servis.'),

# -- Stroj 2 – revize 3
# (2, '2025-02-10', 3, 'bez závady', 'TEST - Kontrola bez zjištěných problémů.'),
# (2, '2025-05-03', 3, 'malá závada', 'TEST - Vyosený modul – seřízeno.'),

# -- Stroj 2 – revize 5
# (2, '2025-07-19', 5, 'bez závady', 'TEST - Zátěžový test OK.'),
# (2, '2025-09-01', 5, 'velká závada', 'TEST - Přehřívání motoru – čeká na náhradní díl.');""")


connection.commit()
