@echo off
REM Wrapper sicuro per lanciare ica_toolchain.py da qualunque sotto-cartella (gestisce spazi e +)
REM %~dp0 = directory di questo .cmd (Tools\). Salgo di uno per arrivare alla root del progetto.
set "ROOT=%~dp0.."
REM Eseguo python del venv e lo script unico passando *tutti* gli argomenti
"%ROOT%\.venv\Scripts\python.exe" "%ROOT%\Tools\ica_toolchain.py" %*
