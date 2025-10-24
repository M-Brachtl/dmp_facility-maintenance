@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set "source=C:\Users\bmaty\Desktop\DMP\backend\database\database.db"
set "backupDir=C:\Users\bmaty\Desktop\DMP\backend\database\backup"
set "baseName=database"
set "ext=.db"

rem Najdi nejbližší volné číslo zálohy
set /a index=1
:loop
if exist "%backupDir%\%baseName%_!index!%ext%" (
    set /a index+=1
    goto loop
)

set "destination=%backupDir%\%baseName%_!index!%ext%"

echo Kopíruju soubor jako: !destination!
copy "%source%" "!destination!" >nul

if !errorlevel! == 0 (
    echo ✅ Soubor byl úspěšně zazálohován jako !destination!
) else (
    echo ❌ Chyba při kopírování.
)