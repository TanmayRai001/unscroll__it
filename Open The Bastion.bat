@echo off
rem The Overgrown Bastion — double-click to open the site
start "Bastion Server" powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0serve-bastion.ps1"
timeout /t 1 /nobreak >nul
start "" "http://localhost:8099/index.html"
