import sqlite3 as sql
import os
## useful later: output = [int(n) for n in test_str.strip("[]").split(", ")]

connection = sql.connect(os.path.dirname(os.path.abspath(__file__)) + "\\database.db")
cursor = connection.cursor()

## machines
def list_machines(**params):
    query = "SELECT id, in_num, name, type, location, revision_array FROM machines"
    filters = []
    for key, value in params.items():
        if key in ["id", "in_num", "name", "type", "location"]:
            filters.append(f"{key} = '{value}'")
        else:
            raise KeyError(f"Neexistující parametr: {key}")
    if filters:
        query += " WHERE " + " AND ".join(filters)
    cursor.execute(query + ";")
    output = []
    for machine in cursor.fetchall():
        # revisions = machine[5]
        revisions = tuple(int(n) for n in machine[5].strip("[]").split(", "))
        output.append((*machine[:5],revisions))
    return output
def add_machine(in_num: str, name: str, type_: str, location: str, revision_array: list = []):
    cursor.execute(
        "INSERT INTO machines (in_num, name, type, location, revision_array) VALUES (?, ?, ?, ?, ?);",
        (in_num, name, type_, location, str(revision_array))
    )
    connection.commit()
    return "success"
def remove_machine(machine_id: int):
    cursor.execute("DELETE FROM machines WHERE id = ?;", (machine_id,))
    connection.commit()
    return "success"

## revision types
def list_revision_types(name = "", rule = 0): # pravidlo se aplikuje pro přesné shody
    query = "SELECT id, name, rule FROM revision_types"
    filters = []
    if name:
        filters.append(f"name = '{name}'")
    if rule:
        filters.append(f"rule = '{rule}'")
    if filters:
        query += " WHERE " + " AND ".join(filters)
    cursor.execute(query + ";")
    return cursor.fetchall()

def add_revision_type(name: str, rule: int):
    cursor.execute(
        "INSERT INTO revision_types (name, rule) VALUES (?, ?) RETURNING id;",
        (name,rule)
    )
    cursor.execute()
    # new_id = cursor.fetchone()
    # cursor.execute(
    #     "ALTER TABLE people ADD COLUMN ? INTEGER DEFAULT 0;",
    #     (f"rev_{new_id}")
    # )
    # Takhle ne, protože to neexistuje

    connection.commit()
    return "success"

def remove_revision_type(revision_type_id: int):
    cursor.execute("SELECT id, in_num, revision_array FROM machines")
    machines_check: list[tuple] = cursor.fetchall()
    dependencies = []
    for machine in machines_check:
        if revision_type_id in tuple(int(n) for n in machine[2].strip("[]").split(", ")):
            dependencies.append(machine[:2])
    if dependencies != []:
        raise RuntimeError("Tento typ revize využívají některé stroje.",dependencies)

    cursor.execute("DELETE FROM machines WHERE id = ?;", (revision_type_id))

    # cursor.execute(
    #     "ALTER TABLE people ;",
    #     (f"rev_{remove_revision_type}")
    # )
    connection.commit()
    return "success"

if __name__ == "__main__":
    # print(add_machine("T_001", "Stroj A", "Test", "Lokace T", [1, 2]))
    add_revision_type("Revize T2", 24)
    print("Databáze:", list_revision_types(),sep="\n")