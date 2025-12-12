# Aplikace pro plánování údržby strojů a školení zaměstnanců
## Odkaz na prezentaci
[Odkaz na prezentaci DMP](https://gamma.app/docs/Vyvoj-aplikace-pro-planovani-udrzby-stroju-a-skoleni-zamestnancu-mpsvevtk5awkbpb)
## Nastavení pracovního prostředí
### Backend - Python Eel
#### Předpoklady
- Python 3.8 nebo vyšší nainstalován. Stáhněte z [python.org](https://www.python.org/).
#### Pokyny pro nastavení
1. Vytvořte a aktivujte virtuální prostředí (volitelné, ale doporučené):
    - Na Windows:
        ```
        python -m venv venv
        .\venv\Scripts\activate
        ```
    - Na macOS/Linux:
        ```
        python3 -m venv venv
        source venv/bin/activate
        ```
2. Nainstalujte požadované balíčky:
    ```
    pip install -r ./requirements.txt
    ```
3. Spusťte aplikaci:
    ```
    python ./main.py
    ```

### Frontend - Angular
#### Předpoklady
- Node.js (verze 16 nebo vyšší) a npm nainstalované. Stáhněte z [nodejs.org](https://nodejs.org/).
- Angular CLI nainstalován globálně: `npm install -g @angular/cli`.

#### Pokyny pro nastavení
1. Přejděte do adresáře frontend:
    ```
    cd ./frontend/dmp-angular
    ```

2. Nainstalujte závislosti:
    ```
    npm install
    ```

3. Spusťte vývojový server:
    ```
    ng serve
    ```
    Aplikace bude dostupná na `http://localhost:4200`.

#### Sestavení pro použití v Eel
Pro kompilaci a sestavení aplikace:
```
ng build
```
Výstup bude v adresáři `./frontend/dist/browser`.

#### Použití stažené kompilované verze
Umístěte obsah do složky `./frontend/dist`.
V souboru `main.py` nastavte proměnnou `testing_no_angular` na `False`.

## O aplikaci
Tato aplikace slouží k plánování údržby strojů a školení zaměstnanců ve firmě. Umožňuje evidovat strojní zařízení, jejich revize, pracovníky a plánovat školení a revize na základě zadaných pravidel.  
Tato aplikace je zpracována v rámci dlouhodobé maturitní práce na Střední průmyslové škole elektrotechnické v Olomouci. 

Autor: Matěj Brachtl
