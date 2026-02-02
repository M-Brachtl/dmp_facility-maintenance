import backend.database.database as dtb
from backend.database.database import dateDTB
import backend.database.planning as planning
import eel

testing_no_angular = True
if testing_no_angular:
    eel.init('frontend/test', js_result_timeout=5000)
else:
    eel.init('frontend/dist/browser', js_result_timeout=5000)

@eel.expose
def get_test():
    return "Test successful!"

@eel.expose
def close_window(*args, **kwargs):
    exit(0)

@eel.expose
def generate_plan_api(file_name: str = "", years: int = 0): # pokud se napíše nebo defaultuje nula, nezapíše se nic do argumentů funkce -> použije se výchozích 10 let
    kwargs = {key: value for key, value in zip(("years", "file_name"), (years,file_name)) if value}
    if plan := planning.generate_plan(**kwargs):
        return {"status": "success", "plan": plan}
    else:
        return {"status": "error", "message": "Při generování plánu došlo k chybě."}
    
#region Database functions exposed to Eel
# dir(dtb) = ['add_machine', 'add_people', 'add_rev_to_machine', 'add_revision_log', 'add_revision_type', 'add_training_log', 'get_machine_name', 'get_periodicity', 'list_facility_activities', 'list_machines', 'list_people', 'list_revision_log', 'list_revision_types', 'list_training_log', 'remove_machine', 'remove_people', 'remove_rev_from_machine', 'remove_revision_log', 'remove_revision_type', 'remove_training_log']
@eel.expose
def list_machines(list_last_revisions = False, params: dict = {}):
    # list_last_revisions = params.pop("list_last_revisions", False)
    return dtb.list_machines(list_last_revisions, **params)
@eel.expose
def add_machine(in_num: str, name: str, type: str, location: str):
    return dtb.add_machine(in_num, name, type, location)
@eel.expose
def remove_machine(machine_id: int):
    try:
        return dtb.remove_machine(machine_id=machine_id)
    except RuntimeError as e:
        if str(e) == "Tento stroj má na sebe vázané revize. Nejprve odstraň periodicitu revize-stroje.":
            return {"status": "error", "message": "DependentRevisions"}
        else:
            raise e
@eel.expose
def add_people(name: str):
    return dtb.add_people(name)
@eel.expose
def list_people(include_inactive: bool = False, params: dict = {}):
    list_last_trainings = params.pop("list_last_trainings", False)
    output = dtb.list_people(include_inactive=include_inactive, list_last_trainings=list_last_trainings, **params)
    print(output)
    return output
@eel.expose
def remove_people(people_id: int):
    return dtb.remove_people(id=people_id)
@eel.expose
def get_periodicity(machine_id: int, revision_type_id: int):
    return dtb.get_periodicity(machine_id, revision_type_id)
@eel.expose
def list_periodicity(machine_id: int = None, revision_type_id: int = None):
    return dtb.list_periodicity(machine_id, revision_type_id)
@eel.expose
def add_rev_to_machine(machine_id: int, revision_type_id: int, periodicity_months: int):
    return dtb.add_rev_to_machine(machine_id, revision_type_id, periodicity_months)
@eel.expose
def remove_rev_from_machine(machine_id: int, revision_type_id: int):
    return dtb.remove_rev_from_machine(machine_id, revision_type_id)
@eel.expose
def add_revision_log(machine_id: int, revision_type_id: int, result: str, person_id: int, notes: str = "", date: str = None):
    if date is not None:
        date = dateDTB(date)
    return dtb.add_revision_log(machine_id, revision_type_id, result, person_id, notes, date)
@eel.expose
def remove_revision_log(log_id: int):
    return dtb.remove_revision_log(log_id)
@eel.expose
def list_revision_log(machine_id: int = None, revision_type_id: int = None, result: str = None, date_from: str = None, date_to: str = None):
    raw_output = dtb.list_revision_log(machine_id, revision_type_id, result, date_from, date_to)
    # seřazení výstupu podle data sestupně
    raw_output.sort(key=lambda x: x[2], reverse=True)

    for i, entry in enumerate(raw_output.copy()):
        entry = list(entry)
        entry[2] = entry[2].__repr__()
        raw_output[i] = tuple(entry)        
    return raw_output
@eel.expose
def add_revision_type(name: str, validity_period: int, facility_activity: bool = False):
    return dtb.add_revision_type(name, validity_period, facility_activity)
@eel.expose
def remove_revision_type(revision_type_id: int):
    try:
        return dtb.remove_revision_type(revision_type_id)
    except RuntimeError as e:
        if str(e).startswith("Tento typ revize využívají některé stroje."):
            return {"status": "error", "message": "DependentMachines", "details": e.args[1]}
        else:
            raise e
@eel.expose
def list_revision_types(_id: int = None, name: str = None, validity_period: int = None, facility_activity: bool = None):
    return dtb.list_revision_types(_id, name, validity_period, facility_activity)
@eel.expose
def add_training_log(people_id: int, revision_type_id: int, date: str = None):
    if date is not None:
        date = dateDTB(date)
    return dtb.add_training_log(people_id, revision_type_id, date)
@eel.expose
def remove_training_log(log_id: int):
    return dtb.remove_training_log(log_id)
@eel.expose
def list_training_log(_id: int = None, person: int = None, min_date: str = None, max_date: str = None, min_e_date: str = None, max_e_date: str = None):
    # key in ["_id", "rev_type", "person", "min_date", "max_date", "min_e_date", "max_e_date"]
    output: list[any] = dtb.list_training_log(_id, person, min_date, max_date, min_e_date, max_e_date)
    # print("Training log:", output)
    # seřazení výstupu podle data sestupně
    for i, entry in enumerate(output.copy()):
        entry = list(entry)
        entry[3] = entry[3].__repr__()
        entry[4] = entry[4].__repr__()
        output[i] = list(entry)
    # print("Formatted training log:", output)
    return output
#endregion
# eel.start('./index.html', size=(800, 600), mode='edge')
print("Starting Eel application...")

eel.start('index.html', mode='edge', close_callback=close_window, cmdline_args=['http://localhost:4200/'], size=(1024, 768))