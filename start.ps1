Clear-Host
$ProjectDir = $PSScriptRoot

Write-Host "Starting BTY Application..." -ForegroundColor Cyan

# 1. Launch FastAPI Backend on Port 8000
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle = 'BTY Backend (FastAPI)'; cd '$ProjectDir'; .\.venv\Scripts\uvicorn app:app --reload --host 127.0.0.1 --port 8005"

# Small delay to let the backend bind ports cleanly
Start-Sleep -Seconds 2

# 2. Launch Vite Frontend explicitly on 127.0.0.1 Port 8080
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle = 'BTY Frontend (Vite)'; cd '$ProjectDir\frontend'; npm run dev -- --host 127.0.0.1 --port 8085"
Write-Host "=====================================================================" -ForegroundColor Green
Write-Host "  SUCCESS: BTY Servers active!                                       " -ForegroundColor Green
Write-Host "  - Backend:  http://127.0.0.1:8005                                 " -ForegroundColor Green
Write-Host "  - Frontend: http://127.0.0.1:8085                                 " -ForegroundColor Green
Write-Host "=====================================================================" -ForegroundColor Green