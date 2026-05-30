@echo off
setlocal

echo ========================================
echo   NeuroCare AI - Setup Database MySQL
echo   (XAMPP)
echo ========================================
echo.

set MYSQL_BIN=C:\xampp\mysql\bin\mysql.exe
set SQL_FILE=%~dp0neurocare_ai.sql

if not exist "%MYSQL_BIN%" (
    echo [ERROR] MySQL XAMPP tidak ditemukan di:
    echo         %MYSQL_BIN%
    echo.
    echo Pastikan XAMPP sudah terinstall dan MySQL sudah di-Start.
    pause
    exit /b 1
)

if not exist "%SQL_FILE%" (
    echo [ERROR] File SQL tidak ditemukan:
    echo         %SQL_FILE%
    pause
    exit /b 1
)

echo [1/3] Membuat database dan tabel...
"%MYSQL_BIN%" -u root < "%SQL_FILE%"
if errorlevel 1 (
    echo [ERROR] Gagal menjalankan neurocare_ai.sql
    pause
    exit /b 1
)
echo       OK - Database neurocare_ai siap.

echo.
echo [2/3] Menginstall dependensi Node.js (mysql2, dotenv)...
cd /d "%~dp0.."
call npm install mysql2 dotenv
if errorlevel 1 (
    echo [ERROR] npm install gagal
    pause
    exit /b 1
)

echo.
echo [3/3] Mengimpor data RS Hermina dari CSV...
call npm run db:seed
if errorlevel 1 (
    echo [ERROR] Seed data gagal
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Setup database selesai!
echo ========================================
echo.
echo   Database : neurocare_ai
echo   Host     : localhost:3306
echo   User     : root (password kosong)
echo.
echo   Buka phpMyAdmin: http://localhost/phpmyadmin
echo.
pause
