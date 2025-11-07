import sqlite3 as sql
import os
import datetime as dt
from calendar import monthrange
## useful later: output = [int(n) for n in test_str.strip("[]").split(", ")]
class dateDTB(dt.date):
    def __new__(cls, date_str: str):
        datetime_prep = dt.datetime.strptime(date_str, "%d/%m/%Y")
        return super().__new__(cls, datetime_prep.year, datetime_prep.month, datetime_prep.day)

    def __str__(self):
        return self.strftime("%d/%m/%Y")

    @classmethod
    def today(cls):
        d = dt.date.today()
        return cls(f"{d.day:02d}/{d.month:02d}/{d.year}")
    
    def add_months(self, months: int):
        months_since_og_year = self.month + months
        year = self.year + months_since_og_year // 12
        month = months_since_og_year % 12

        # Upravit na poslední den nového měsíce
        day = min(self.day, monthrange(year, month)[1])

        return dateDTB(f"{day}/{month}/{year}")

connection = sql.connect(os.path.dirname(os.path.abspath(__file__)) + "\\database.db")
cursor = connection.cursor()

## machines
def list_machines(**params):
    query = "SELECT id, in_num, name, type, location, revision_array FROM machines"
    filters = []
    for key, value in params.items():
        if key in ["_id", "in_num", "name", "type", "location"]:
            if key == "_id": key = "id" # aby se nepletlo s pythonovskými předdefinovanými věcmi
            filters.append(f"{key} = '{value}'")
        else:
            raise KeyError(f"Neexistující parametr: {key}")
    if filters:
        query += " WHERE " + " AND ".join(filters)
    cursor.execute(query + ";")
    output = []
    for machine in cursor.fetchall():
        # revisions = machine[5]
        if machine[5] == "[]":
            revisions = []
        else:
            revisions = tuple(int(n) for n in machine[5].strip("[]").split(", "))
        output.append((*machine[:5],revisions))
    return output

def get_machine_name(id: int, include_IN_NUM: bool = False):
    in_num_request = ""
    if include_IN_NUM:
        in_num_request = ", in_num"
    cursor.execute(
        f"SELECT name{in_num_request} FROM machines WHERE id=?",
        (id,)
    )
    raw_output = cursor.fetchone()
    if include_IN_NUM:
        return {
            "name": raw_output[0],
            "in_num": raw_output[1]
        }
    else:
        return raw_output[0]

def add_machine(in_num: str, name: str, type_: str, location: str): #, revision_array: list = [] --nepoužívaný parametr //, str(revision_array)
    cursor.execute(
        "INSERT INTO machines (in_num, name, type, location) VALUES (?, ?, ?, ?);",
        (in_num, name, type_, location)
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
    new_id = cursor.fetchone()[0]
    # print(new_id)
    cursor.execute("SELECT id, untrained_rev FROM people")
    raw_output: str = cursor.fetchall()
    for person in raw_output:
        updated_untr_rev = [new_id]
        if person[1] != "[]":
            updated_untr_rev = [int(n) for n in person[1].strip("[]").split(", ")] + updated_untr_rev
        cursor.execute(
            "UPDATE people SET untrained_rev = ? WHERE id = ?;",
            (str(updated_untr_rev), person[0])
        )

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

    cursor.execute("DELETE FROM machines WHERE id = ?;", (revision_type_id,))

    cursor.execute("SELECT id, trained_rev, untrained_rev FROM people")
    raw_output: str = cursor.fetchall()
    for person in raw_output:
        if person[1] != "[]":
            updated_untr_rev = [int(n) for n in person[1].strip("[]").split(", ")].pop(revision_type_id)
        else:
            updated_untr_rev = []
        if person[2] != "[]":
            updated_tr_rev = [int(n) for n in person[2].strip("[]").split(", ")].pop(revision_type_id)
        else:
            updated_tr_rev = []
        cursor.execute(
            "UPDATE people SET trained_rev = ?, untrained_rev = ? WHERE id = ?;",
            (str(updated_tr_rev), str(updated_untr_rev), person[0])
        )
    connection.commit()
    return "success"

def list_people(name = ""):
    query = "SELECT * FROM people"
    if name != "":
        query += f" WHERE name = '{name}'"
    cursor.execute(query + ";")
    raw_output = cursor.fetchall()
    output = []
    for person in raw_output:
        if person[3] == '[]':
            untr_rev = []
        else:
            untr_rev = [int(n) for n in person[3].strip("[]").split(", ")]
        if person[2] == '[]':
            tr_rev = []
        else:
            tr_rev = [int(n) for n in person[2].strip("[]").split(", ")]
        
        output.append([*person[:2], tr_rev, untr_rev])

    return output

def add_people(name: str, trained_rev: list[int] = []):
    cursor.execute("SELECT id FROM revision_types")
    untr_rev = [int(row[0]) for row in cursor.fetchall()]
    # print(untr_rev)
    for rev_type in trained_rev:
        print(untr_rev, rev_type)
        untr_rev.remove(rev_type)
    
    cursor.execute(
        "INSERT INTO people (name, trained_rev, untrained_rev) VALUES (?, ?, ?);",
        (name, str(trained_rev), str(untr_rev))
    )
    connection.commit()
    return "success"

def remove_people(id: int):
    cursor.execute(
        "DELETE FROM people WHERE id = ?;",
        (id,)
    )
    connection.commit()
    return "success"

def list_revision_log(machine_id: int = 0, rev_type: int = 0, result: str = ""): # validní result: bez závady/malá závada/velká závada
    query = "SELECT * FROM revision_log"
    additional_query = ""
    if machine_id or rev_type or result:
        additional_query += " WHERE "
    if machine_id:
        additional_query += f"machine_id = {machine_id} AND "
    if rev_type:
        additional_query += f"type = {machine_id} AND "
    if result:
        if result not in ("bez závady","malá závada","velká závada"):
            raise ValueError("Hodnota result není validní.")
        additional_query += f"result = {result}"
    additional_query = additional_query.strip(" AND ")

    cursor.execute(query + additional_query + ";")
    return cursor.fetchall()

def add_revision_log(machine_id: int, date: str, rev_type: int, result: str, notes: str): # validní result: bez závady/malá závada/velká závada
    if result not in ("bez závady","malá závada","velká závada"):
        raise ValueError("Hodnota result není validní.")
    cursor.execute(
        "INSERT INTO revision_log (machine_id, date, type, result, notes) VALUES (?, ?, ?, ?, ?)",
        (machine_id, date, rev_type, result, notes)
    )
    connection.commit()
    return "success"

def remove_revision_log(log_id: int):
    cursor.execute(
        "DELETE FROM revision_log WHERE id=?;",
        (log_id,)
    )
    connection.commit()
    return "success"

def add_rev_to_machine(machine_id: int, rev_id: int, rule: int): # rule je v měsících
    revision_array: tuple = list(list_machines(_id=machine_id)[0][5]) + [rev_id]
    if revision_array.count(rev_id) > 1:
        raise ValueError("Revize je už zapsaná.")
    cursor.execute(
        "UPDATE machines SET revision_array = ? WHERE id = ?;",
        (str(revision_array), machine_id)
    )
    cursor.execute(
        "INSERT INTO periodicity (revision_type, machine, rule) VALUES (?,?,?);",
        (rev_id, machine_id, rule)
    )
    connection.commit()
    return "success"

def remove_rev_from_machine(machine_id: int, rev_id: int):
    revision_array = list(list_machines(_id=machine_id)[0][5])
    revision_array.remove(rev_id)
    cursor.execute(
        "UPDATE machines SET revision_array = ? WHERE id = ?;",
        (str(revision_array), machine_id)
    )
    connection.commit()
    return "success"

def add_training_log(rev_type, person, date: dateDTB = dateDTB.today()):
    cursor.execute("SELECT validity_period FROM revision_types WHERE id = ?", (rev_type,))
    rule = cursor.fetchone()[0]
    expiration_date = date.add_months(rule)
    cursor.execute(
        "INSERT INTO training_log (revision_type, person, date, expiration_date) VALUES (?,?,?,?)",
        (rev_type, person, str(date), str(expiration_date))
    )
    connection.commit()
    return "success"

def list_training_log(**params):
    query = "SELECT * FROM training_log"
    filters = []
    date_filter = (None, None)
    e_date_filter = (None, None)
    if ("month" in params.items() and "year" not in params.items()) or ("e_month" in params.items() and "e_year" not in params.items()):
        raise TypeError("Při filtrování dle data je nutno zadat rok.")
    for key, value in params.items():
        if key in ["_id", "rev_type", "person", "month", "year", "e_month", "e_year"]:
            if key == "_id":
                filters.append(f"id = '{value}'")
            elif key == "month":
                date_filter[0] = value
            elif key == "e_month":
                e_date_filter[0] = value
            elif key == "year":
                date_filter[0] = value
            elif key == "e_year":
                e_date_filter[0] = value
            else:
                filters.append(f"{key} = '{value}'")
        else:
            raise KeyError(f"Neexistující parametr: {key}")
    if date_filter[1]:
        if date_filter[0]:
            filters.append(f"date LIKE '%/{date_filter[0]}/{date_filter[1]}'")
        else:
            filters.append(f"date LIKE '%/%/{date_filter[1]}'")
    if e_date_filter[1]:
        if e_date_filter[0]:
            filters.append(f"expiration_date LIKE '%/{e_date_filter[0]}/{e_date_filter[1]}'")
        else:
            filters.append(f"expiration_date LIKE '%/%/{e_date_filter[1]}'")
    if filters:
        query += " WHERE " + " AND ".join(filters)
    cursor.execute(query + ";")
    output = cursor.fetchall()
    for index, log in enumerate(output.copy()):
        output[index] = list(output[index])
        output[index][3] = dateDTB(log[3])
        output[index][4] = dateDTB(log[4])
        output[index] = tuple(output[index])
    return output

def remove_training_log(_id: int):
    cursor.execute("DELETE FROM training_log WHERE id = ?;", (_id,))
    connection.commit()
    return "success"

if __name__ == "__main__":
    # os.system(".\\backup.bat")
    # print(add_machine("T_001", "Stroj A", "Test", "Lokace T", [1, 2]))
    # add_revision_type("Revize T3-P", 48)
    # add_people("Adam Testovač", [1])
    # add_people("Matyk Testovač-C2")
    # remove_people(1)
    # remove_people()
    # add_revision_log(1, "12/11/2025", 1, "velká závada", "test")
    # print(get_machine_name(1, 1))
    # remove_revision_log(2)
    # remove_rev_from_machine(1,1)
    # add_rev_to_machine(1,2,24)
    add_training_log(1,1)
    print("Databáze:", list_training_log(_id=1),sep="\n")