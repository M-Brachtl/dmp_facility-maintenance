# Aplikace pro plánování údržby strojů a školení zaměstnanců
## Odkaz na prezentaci
[Odkaz na prezentaci DMP](https://gamma.app/docs/Vyvoj-aplikace-pro-planovani-udrzby-stroju-a-skoleni-zamestnancu-mpsvevtk5awkbpb)
## Nastavení pracovního prostředí pro Angular frontend
### Předpoklady
- Node.js (verze 16 nebo vyšší) a npm nainstalované. Stáhněte z [nodejs.org](https://nodejs.org/).
- Angular CLI nainstalován globálně: `npm install -g @angular/cli`.

### Pokyny pro nastavení
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

### Sestavení pro použití v Eel
Pro kompilaci a sestavení aplikace:
```
ng build
```
Výstup bude v adresáři `./frontend/dist/browser`.