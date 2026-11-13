@echo off
for /d %%N in ("%~dp0..\.civilcraft-local\node-v*-win-x64") do set "CIVILCRAFT_NODE=%%~fN"
set "PATH=%CIVILCRAFT_NODE%;%~dp0..\.civilcraft-local\php;%~dp0..\.civilcraft-local\git\cmd;%PATH%"
for /d %%P in ("%~dp0..\.civilcraft-local\poppler\poppler-*") do set "PATH=%%~fP\Library\bin;%PATH%"
