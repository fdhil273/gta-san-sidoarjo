@echo off
title GTA: San Sidoarjo (100%% Offline Ready)
cd /d "%~dp0"
echo Menjalankan GTA: San Sidoarjo di http://localhost:4173 (100%% Offline)...
start "" http://localhost:4173
node server.mjs
pause
