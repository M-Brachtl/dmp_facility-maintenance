import backend.database.database as dtb
from backend.database.database import dateDTB
import eel

eel.init('frontend')

@eel.expose
def get_test():
    return "Test successful!"

eel.start('index.html', size=(800, 600), mode='edge')