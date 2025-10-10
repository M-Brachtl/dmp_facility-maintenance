# Plán tvorby
## Specifikace požadavků
![pozadavky.png](pozadavky.png)
## Části aplikace
* Databáze a její API (sqlite + python/json)
* Backend aplikace (python-Eel)
* Frontend aplikace (angular)
## Náležitosti částí
### Databáze
* Typy dat: 
    * Strojní zařízení
    * Revize strojních zařízení (datum revize, její výsledek, poznámka, typ případné závady, pravidlo pro plánování revize, typ revize, stav stroje-likvidace)
    * Pracovníci (jméno, aktuální proškolenost <b>(? výčet školení/u každého školení informace T/F)</b>)
    * Školení dle typu revizí a činností (<b>? která bude hlavní informace, školení nebo revize/činnost</b>)
    * Plány revizí, školení <b>(! ukazovat dostupné pracovníky - ukládat/generovat)</b>; bude ve formě jsonu ve složce ./backend/database/plans
* API:
    * Python, knihovna sqlite3
    * Sqlite část budou funkce, které spouští SQL příkazy, main.py by neměl mít k databázi žádný přímý přístup
    * JSON část budou funkce stejným způsobem jako u sqlite, jednotlivé pro dané plány; zvaž ukládání do "backup" složky jako poslední záchrana pro uživatele
    * Soubor main.py by opět neměl přistupovat k žádným souborům přímo, pokud přibydou nové části, které je potřeba ukládat, je vždy nutno vytvořit prostředníka importovaného do main.py
* Databáze je priorita číslo 1 protože veškeré fungování je na ní závislé a je potřeba mít maximum času pro ladění její podoby

