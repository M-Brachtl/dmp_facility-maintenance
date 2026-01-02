import sqlite3 as sql
import os
import datetime as dt
from calendar import monthrange
try:
    from . import backup
except ImportError:
    import backup

## useful later: output = [int(n) for n in test_str.strip("[]").split(", ")]
class dateDTB(dt.date):
    def __new__(cls, date_str: str):
        try:
            datetime_prep = dt.datetime.strptime(date_str, "%d/%m/%Y")
        except ValueError:
            datetime_prep = dt.datetime.strptime(date_str, "%Y-%m-%d")
        return super().__new__(cls, datetime_prep.year, datetime_prep.month, datetime_prep.day)

    def __str__(self):
        return self.strftime("%d/%m/%Y")
    
    def __repr__(self):
        return self.strftime("%Y-%m-%d")

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
    
    def convert_to_date(self):
        return dt.date(self.year, self.month, self.day)

connection = sql.connect(os.path.dirname(os.path.abspath(__file__)) + "\\database.db")
cursor = connection.cursor()

# region functions
## machines (fiktivní id=0 - facility není v databázi)
def list_machines(list_last_revisions=False, **params):
    # if ("_id", 0) in params.items():
    #     return [(0, "FACILITY", "Facility", "Fictive - Facility", "No Location", [])]
    if list_last_revisions:
        params["list_last_revisions"] = True
    query = "SELECT id, in_num, name, type, location, revision_array, disposed FROM machines"
    filters = []
    for key, value in params.items():
        if key in ["_id", "in_num", "name", "type", "location", "disposed"]:
            if key == "_id": key = "id" # aby se nepletlo s pythonovskými předdefinovanými věcmi
            filters.append(f"{key} = '{value}'")
        elif key == "list_last_revisions" and value:
            # raise NotImplementedError("Funkce ještě není implementována.")
            continue # posléze bude spuštěna funkce na výpis platných revizí dle tabulky revision_log
        else:
            raise KeyError(f"Neexistující parametr: {key}")
    if filters:
        query += " WHERE " + " AND ".join(filters)
    cursor.execute(query + ";")
    output_raw = cursor.fetchall()
    # if ("_id", 0) in params.items():
    output_raw = [(0, "FACILITY", "Facility", "Fictive - Facility", "No Location", str(list_facility_activities()), 0)] + output_raw
    output = []
    for machine in output_raw:
        # revisions = machine[5]
        if machine[5] == "[]":
            revisions = []
        else:
            revisions = [int(n) for n in machine[5].strip("[]").split(", ")]

        # přidání revizí ve formátu (log_id, rev_type, datum)
        log_list = []
        if list_last_revisions:
            cursor.execute("""SELECT id, type, date FROM revision_log AS og_log WHERE machine_id=? AND date=(
                    SELECT MAX(log.date) FROM revision_log AS log WHERE log.machine_id=og_log.machine_id AND log.type=og_log.type
                )""",
                (machine[0],)
            )
            log_list = cursor.fetchall()
            for lID, log in enumerate(log_list):
                log_list[lID] = list(log_list[lID])
                log_list[lID][2] = dateDTB(log[2])
                log_list[lID] = tuple(log_list[lID])

        output.append((*machine[:5],revisions, machine[6], log_list))
    return output

def get_machine_name(id: int, include_IN_NUM: bool = False):
    if id == 0:
        return "FACILITY"
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
    # check for duplicate in_num
    cursor.execute("SELECT id FROM machines WHERE in_num = ?;", (in_num,))
    if cursor.fetchall() != []:
        raise RuntimeError("Stroj s tímto inventárním číslem už existuje.")
    
    cursor.execute(
        "INSERT INTO machines (in_num, name, type, location, revision_array) VALUES (?, ?, ?, ?, '[]');",
        (in_num, name, type_, location)
    )
    connection.commit()
    return "success"
def remove_machine(machine_id: int):
    cursor.execute("SELECT * FROM periodicity WHERE machine = ?;", (machine_id,))
    if cursor.fetchall() != []:
        raise RuntimeError("Tento stroj má na sebe vázané revize. Nejprve odstraň periodicitu revize-stroje.")

    cursor.execute("DELETE FROM machines WHERE id = ?;", (machine_id,))
    connection.commit()
    return "success"

## revision types
def list_revision_types(_id: int = 0, name: str = "", validity_period: int = 0, facility_activity: bool = False): # pravidlo se aplikuje pro přesné shody
    query = "SELECT id, name, validity_period, facility_activity FROM revision_types"
    filters = []
    if _id:
        filters.append(f"id = {_id}")
    if name:
        filters.append(f"name = '{name}'")
    if validity_period:
        filters.append(f"validity_period = '{validity_period}'")
    if facility_activity:
        filters.append(f"facility_activity = '{facility_activity}'")
    if filters:
        query += " WHERE " + " AND ".join(filters)
    cursor.execute(query + ";")
    return cursor.fetchall()

def add_revision_type(name: str, validity_period: int, facility_activity: bool = False):
    cursor.execute(
        "INSERT INTO revision_types (name, validity_period, facility_activity) VALUES (?, ?, ?);", # RETURNING id
        (name,validity_period,facility_activity)
    )
    # new_id = cursor.fetchone()[0]
    # # print(new_id)
    # cursor.execute("SELECT id, untrained_rev FROM people")
    # raw_output: str = cursor.fetchall()
    # for person in raw_output:
    #     updated_untr_rev = [new_id]
    #     if person[1] != "[]":
    #         updated_untr_rev = [int(n) for n in person[1].strip("[]").split(", ")] + updated_untr_rev
    #     cursor.execute(
    #         "UPDATE people SET untrained_rev = ? WHERE id = ?;",
    #         (str(updated_untr_rev), person[0])
    #     )

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

    cursor.execute("DELETE FROM revision_types WHERE id = ?;", (revision_type_id,))

    # cursor.execute("SELECT id, trained_rev, untrained_rev FROM people")
    # raw_output: str = cursor.fetchall()
    # for person in raw_output:
    #     if person[1] != "[]":
    #         updated_untr_rev = [int(n) for n in person[1].strip("[]").split(", ")].pop(revision_type_id)
    #     else:
    #         updated_untr_rev = []
    #     if person[2] != "[]":
    #         updated_tr_rev = [int(n) for n in person[2].strip("[]").split(", ")].pop(revision_type_id)
    #     else:
    #         updated_tr_rev = []
    #     cursor.execute(
    #         "UPDATE people SET trained_rev = ?, untrained_rev = ? WHERE id = ?;",
    #         (str(updated_tr_rev), str(updated_untr_rev), person[0])
    #     )
    connection.commit()
    return "success"

def list_people(name = "", list_last_trainings: bool = False):
    query = "SELECT * FROM people"
    if name != "":
        query += f" WHERE name = '{name}'"
    cursor.execute(query + ";")
    
    if list_last_trainings:
        output = []
        for person in cursor.fetchall():
            cursor.execute("""SELECT id, revision_type, date FROM training_log AS og_log WHERE person=? AND date=(
                    SELECT MAX(log.date) FROM training_log AS log WHERE log.person=og_log.person AND log.revision_type=og_log.revision_type
                )""",
                (person[0],)
            )
            log_list = cursor.fetchall()
            for lID, log in enumerate(log_list):
                log_list[lID] = list(log_list[lID])
                log_list[lID][2] = dateDTB(log[2])
                log_list[lID] = tuple(log_list[lID])
            output.append((*person, log_list))
        return output

    return cursor.fetchall() #output

def add_people(name: str): #, trained_rev: list = [] - nepoužívaný parametr
    cursor.execute("SELECT id FROM revision_types")
    
    cursor.execute(
        "INSERT INTO people (name) VALUES (?);",
        (name,)
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

def list_revision_log(machine_id: int = 0, rev_type: int = 0, result: str = "", min_date: dateDTB = None, max_date: dateDTB = None): # validní result: bez závady/malá závada/velká závada
    if isinstance(min_date, str) or isinstance(max_date, str):
        raise TypeError("min_date a max_date musí být typu dateDTB nebo None.")
    query = "SELECT * FROM revision_log"
    additional_query = ""
    if machine_id or rev_type or result or min_date or max_date:
        additional_query += " WHERE "
    if machine_id:
        additional_query += f"machine_id = {machine_id} AND "
    if rev_type:
        additional_query += f"type = {rev_type} AND "
    if min_date:
        additional_query += f"date >= '{repr(min_date)}' AND "
    if max_date:
        additional_query += f"date <= '{repr(max_date)}' AND "
    if result:
        if result not in ("bez závady","malá závada","velká závada"):
            raise ValueError("Hodnota result není validní.")
        additional_query += f"result = {result}"
    additional_query = " " + additional_query.strip(" AND ")
    print(query + additional_query + ";")
    cursor.execute(query + additional_query + ";")
    output_raw = cursor.fetchall()
    output = []
    for log in output_raw:
        log_list = list(log)
        log_list[2] = dateDTB(log[2])
        output.append(tuple(log_list))

    return output

def add_revision_log(machine_id: int, rev_type: int, result: str, notes: str = "", date: dateDTB = dateDTB.today()): # validní result: bez závady/malá závada/velká závada
    if result not in ("bez závady","malá závada","velká závada"):
        raise ValueError("Hodnota result není validní.")
    cursor.execute(
        "INSERT INTO revision_log (machine_id, date, type, result, notes) VALUES (?, ?, ?, ?, ?)",
        (machine_id, repr(date), rev_type, result, notes)
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
    if machine_id != 0:
        if list_revision_types(_id=rev_id)[0][3]: # facility_activity
            raise ValueError("Revize je činnost, nelze přiřadit stroji.")
        revision_array: list = list_machines(_id=machine_id)[0][5] + [rev_id]
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
    if machine_id != 0:
        revision_array = list(list_machines(_id=machine_id)[0][5])
        revision_array.remove(rev_id)
        cursor.execute(
            "UPDATE machines SET revision_array = ? WHERE id = ?;",
            (str(revision_array), machine_id)
        )

    cursor.execute(
        "DELETE FROM periodicity WHERE revision_type = ? AND machine = ?;",
        (rev_id, machine_id)
    )

    connection.commit()
    return "success"

def add_training_log(rev_type, person, date: dateDTB = dateDTB.today()):
    cursor.execute("SELECT validity_period FROM revision_types WHERE id = ?", (rev_type,))
    rule = cursor.fetchone()[0]
    expiration_date = date.add_months(rule)
    cursor.execute(
        "INSERT INTO training_log (revision_type, person, date, expiration_date) VALUES (?,?,?,?)",
        (rev_type, person, repr(date), repr(expiration_date))
    )
    connection.commit()
    return "success"

def list_training_log(**params):
    query = "SELECT id, revision_type, person, strftime('%d/%m/%Y', date), strftime('%d/%m/%Y', expiration_date) FROM training_log"
    filters = []
    # date_filter = (None, None)
    # e_date_filter = (None, None)
    if ("month" in params.items() and "year" not in params.items()) or ("e_month" in params.items() and "e_year" not in params.items()):
        raise TypeError("Při filtrování dle data je nutno zadat rok.")
    for key, value in params.items():
        if key in ["_id", "rev_type", "person", "min_date", "max_date", "min_e_date", "max_e_date"]:
            if key == "_id":
                filters.append(f"id = '{value}'")
            # elif key == "month":
            #     date_filter[0] = value
            # elif key == "e_month":
            #     e_date_filter[0] = value
            # elif key == "year":
            #     date_filter[0] = value
            # elif key == "e_year":
            #     e_date_filter[0] = value
            elif (key == "min_date" or key == "max_date") and isinstance(value, dateDTB):
                date_column = "date"
                comparator = ">="
                if key.startswith("max_"):
                    comparator = "<="
                filters.append(f"{date_column} {comparator} '{repr(value)}'")
            elif (key == "min_e_date" or key == "max_e_date") and isinstance(value, dateDTB):
                date_column = "expiration_date"
                comparator = ">="
                if key.startswith("max_"):
                    comparator = "<="
                filters.append(f"{date_column} {comparator} '{repr(value)}'")
            else:
                filters.append(f"{key} = '{value}'")
        else:
            raise KeyError(f"Neexistující parametr: {key}")
    # if date_filter[1]:
    #     if date_filter[0]:
    #         filters.append(f"date LIKE '%/{date_filter[0]}/{date_filter[1]}'")
    #     else:
    #         filters.append(f"date LIKE '%/%/{date_filter[1]}'")
    # if e_date_filter[1]:
    #     if e_date_filter[0]:
    #         filters.append(f"expiration_date LIKE '%/{e_date_filter[0]}/{e_date_filter[1]}'")
    #     else:
    #         filters.append(f"expiration_date LIKE '%/%/{e_date_filter[1]}'")
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

def get_periodicity(machine_id: int, rev_id: int) -> int:
    cursor.execute("SELECT rule FROM periodicity WHERE revision_type=? AND machine=?;",(rev_id,machine_id))
    return cursor.fetchone()[0]

def list_facility_activities() -> list[int]:
    cursor.execute("SELECT revision_type FROM periodicity WHERE machine=0;")
    raw_output = cursor.fetchall()
    return [rev[0] for rev in raw_output]

# endregion

# region speciální funkce
def clean_database(): # odstraní všechen obsah databáze (krom tabulek a jejich struktur)
    # if input("Napiš 'ANO', pokud sis zazálohoval databázi a máš 100% jistotu, že chceš pokračovat: ") != "ANO":
    #     raise ValueError("!! Smazání databáze zrušeno. !!")
    backup.backup_database()
    # if input("Zkontroluj, jestli se databáze zazálohovala ('JO'): ") != "JO":
    #     raise ValueError("!! Smazání databáze zrušeno. !!")

    cursor.execute("DELETE FROM machines;")
    cursor.execute("DELETE FROM people;")
    cursor.execute("DELETE FROM periodicity;")
    cursor.execute("DELETE FROM revision_log;")
    cursor.execute("DELETE FROM revision_types;")
    cursor.execute("DELETE FROM training_log;")

    connection.commit()
    return "success"

def recover_database(backup_path: str):
    backup.backup_database()
    backup.restore_database(2)

def clear_backups():
    backup.clear_backups()


if __name__ == "__main__":
    # backup.backup_database()
    # print(add_machine("T_002-D", "Stroj B", "Test", "Lokace TD"))
    # add_revision_type("Revize New_test 1", 60)
    # add_people("Adam Testovač", [1])
    # add_people("Matyk Testovač-C2")
    # remove_people(1)
    # remove_people()
    # add_revision_log(1, "12/11/2025", 1, "velká závada", "test")
    # print(get_machine_name(1, 1))
    # remove_revision_log(2)
    # remove_rev_from_machine(2,3)
    # add_rev_to_machine(0,4,18)
    # add_training_log(1,1)
    # remove_revision_type(2)
    # remove_machine(2)
    # remove_machine(3)
    # add_machine("NM-001", "New Test Machine vz.1", "Test", "New Testing Facility")
    # print("Databáze:", list_machines(list_last_revisions=True),sep="\n")
    # print("Databáze:", get_periodicity(1,2),sep="\n")
    print("Databáze - machines:", list_machines(),sep="\n")
    # clean_database()
    # recover_database(3)
    # clear_backups()