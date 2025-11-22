from datetime import date
import os
try:
    from . import database as dtb
    from .database import dateDTB
except ImportError:
    import database as dtb
    from database import dateDTB

from json import dump, load

today = dateDTB.today()

def generate_plan(years: int = 10):
    plan = {
        "machines": [], # pro každá index: None | (di, in_num, name, seznam plánovaných revizí(rev_id, rev_type, datum, edited))
        "people": [] # pro každá index: None | (name, seznam plánovaných tréninků(rev_id, rev_type, datum, edited))
    }
    machines_data = dtb.list_machines(list_last_revisions=True)
    end_date = today.add_months(years*12)
    
    for machine in machines_data:
        planned_revs = []
        for rev_type in machine[5]: # projeď každou revizi daného stroje
            periodicity = dtb.get_periodicity(machine[0],rev_type)
            for last_log in machine[6]: # hledání data poslední revize
                if last_log[1] == rev_type:
                    work_date: dateDTB = last_log[2]
            try:
                work_date
            except UnboundLocalError:
                work_date = today.add_months(-periodicity)
            work_date = work_date.add_months(periodicity)
            while work_date <= end_date:
                planned_revs.append((rev_type, dtb.list_revision_types(_id=rev_type)[0][1], repr(work_date), False))
                work_date = work_date.add_months(periodicity)
            del work_date
        plan["machines"].append([*machine[:3], planned_revs])

    people_data = dtb.list_people(list_last_trainings=True)
    for person in people_data:
        planned_trainings = []
        list_of_revs = [rev[0] for rev in dtb.list_revision_types()] # získej všechny tréninky, protože lidé musí dělat všechny
        for training_type in list_of_revs: # projeď každý trénink dané osoby
            periodicity = dtb.list_revision_types(_id=training_type)[0][2]
            for last_log in person[2]: # hledání data posledního tréninku
                if last_log[1] == training_type:
                    work_date: dateDTB = last_log[2]
            try:
                work_date
            except UnboundLocalError:
                work_date = today.add_months(-periodicity)
            work_date = work_date.add_months(periodicity)
            while work_date <= end_date:
                planned_trainings.append((training_type, dtb.list_revision_types(_id=training_type)[0][1], repr(work_date), False))
                work_date = work_date.add_months(periodicity)
            del work_date
        plan["people"].append([*person[:2], planned_trainings])

    file_name = f"plan_{today.year}_{today.month}_{today.day}.json"
    # zkontroluj jestli file_name neexistuje
    increment = 1
    while os.path.exists(os.path.join(os.path.dirname(os.path.abspath(__file__)), "plans", file_name)):
        file_name = f"plan_{today.year}_{today.month}_{today.day}_{increment}.json"
        increment += 1

    dump(plan, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "plans", file_name), "w", encoding="utf-8"), ensure_ascii=False)
    return plan

def get_plan(file_name: str):
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "plans", file_name), "r", encoding="utf-8") as f:
        return load(f)
    
def save_plan(plan: dict, file_name: str):
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "plans", file_name), "w", encoding="utf-8") as f:
        dump(plan, f, ensure_ascii=False)
    # test if able to parse back
    try:
        with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "plans", file_name), "r", encoding="utf-8") as f:
            _ = load(f)
    except Exception as e:
        print(f"Error při kontrole uloženého plánu: {e}, soubor může být poškozen.")

if __name__ == "__main__":
    generate_plan()