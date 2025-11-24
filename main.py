import backend.database.database as dtb
from backend.database.database import dateDTB
import backend.database.planning as planning
import eel

testing_no_angular = True
if testing_no_angular:
    eel.init('frontend/test')
else:
    eel.init('frontend/dist/browser')

@eel.expose
def get_test():
    return "Test successful!"

@eel.expose
def close_window():
    exit()

@eel.expose
def generate_plan_api(file_name: str = "", years: int = 0): # pokud se napíše nebo defaultuje nula, nezapíše se nic do argumentů funkce -> použije se výchozích 10 let
    kwargs = {key: value for key, value in zip(("years", "file_name"), (years,file_name)) if value}
    if planning.generate_plan(**kwargs):
        return {"status": "success", "message": "Plán byl úspěšně vygenerován."}
    else:
        return {"status": "error", "message": "Při generování plánu došlo k chybě."}

# eel.start('./index.html', size=(800, 600), mode='edge')
print("Starting Eel application...")

eel.start('index.html', size=(800, 600), mode='edge')