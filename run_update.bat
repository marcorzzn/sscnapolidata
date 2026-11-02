@echo off
REM ============================================================================
REM SSC Napoli Encyclopedia - Script di Aggiornamento Periodico (Delta Update)
REM Eseguibile manualmente (doppio click) o tramite Windows Task Scheduler
REM ============================================================================

cd /d "%~dp0"
echo [INFO] Inizio aggiornamento incrementale SSC Napoli Data...
echo [INFO] Data e ora: %date% %time%

if exist .venv\Scripts\python.exe (
    set PYTHON_EXE=.venv\Scripts\python.exe
) else if exist "..\scrp napoli\.venv\Scripts\python.exe" (
    set PYTHON_EXE="..\scrp napoli\.venv\Scripts\python.exe"
) else (
    set PYTHON_EXE=python
)

%PYTHON_EXE% run_update.py --mode delta

if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Aggiornamento completato con successo!
) else (
    echo [ERROR] Si e verificato un errore durante l'aggiornamento. Codice: %ERRORLEVEL%
)

timeout /t 5 >nul
