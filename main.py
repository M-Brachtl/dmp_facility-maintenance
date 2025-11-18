import backend.database.database as dtb
from backend.database.database import dateDTB
import eel

eel.init('frontend/dist/browser')

@eel.expose
def get_test():
    return "Test successful!"

@eel.expose
def close_window():
    exit()

# eel.start('./index.html', size=(800, 600), mode='edge')
print("Starting Eel application...")

eel.start('index.html', size=(800, 600), mode='edge')