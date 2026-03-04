try:
    from . import database as dtb
    from .database import dateDTB
except ImportError:
    import database as dtb
    from database import dateDTB

today = dateDTB.today()

def generate_plan(years: int = 10):
    plan = {
        "machines": [], # pro každá index: None | (di, in_num, name, seznam plánovaných revizí(rev_id, rev_type, datum, edited))
        "people": [] # pro každá index: None | (name, seznam plánovaných tréninků(rev_id, rev_type, datum, edited))
    }
    machines_data = dtb.list_machines(list_last_revisions=True)
    end_date = today.add_months(years*12)
    
    for machine in machines_data:
        if machine[6] != "": # pokud je zklikvidovaný, neplánuj žádné revize
            continue
        planned_revs = []
        for rev_type in machine[5]: # projeď každou revizi daného stroje
            periodicity = dtb.get_periodicity(machine[0],rev_type)
            for last_log in machine[7]: # hledání data poslední revize
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
        list_of_revs = dtb.get_assignment(person[0])[1] # získej všechny tréninky, které jsou přiřazené dané osobě
        for training_type in list_of_revs: # projeď každý trénink dané osoby
            periodicity = dtb.list_revision_types(_id=training_type)[0][2]
            for last_log in person[3]: # hledání data posledního tréninku
                if last_log[1] == training_type:
                    work_date: dateDTB = last_log[2]
            try:
                work_date
            except UnboundLocalError:
                work_date = today.add_months(-periodicity)
            work_date = work_date.add_months(periodicity)
            i = 0
            while work_date <= end_date:
                planned_trainings.append((training_type, dtb.list_revision_types(_id=training_type)[0][1], repr(work_date), False))
                work_date = work_date.add_months(periodicity)
                if i < 1000:
                    # print(work_date, end_date, periodicity)
                    pass
                elif i == 1000:
                    # print("...")
                    raise RuntimeError(f"Nekonečná smyčka, periodicita = {periodicity}")
                i += 1
            del work_date
        plan["people"].append([*person[:2], planned_trainings])
    return plan

if __name__ == "__main__":
    # generate_plan()
    print(dtb.list_machines(list_last_revisions=True))