@echo off
call "%~dp0local-setup\Environment.cmd"
"%CIVILCRAFT_NODE%\node.exe" "%~dp0local-setup\control.mjs" start
if errorlevel 1 pause
