# SmartGovAI FastAPI backend

This service is the new SmartGovAI backend foundation. Phase 1 Task 2 intentionally contains only application configuration, CORS, logging, and the health endpoint.

## Requirements

- Python 3.11

## Local setup

From the repository root in PowerShell:

```powershell
py -3.11 -m venv backend-api/.venv
Copy-Item backend-api/.env.example backend-api/.env
backend-api/.venv/Scripts/python.exe -m pip install --upgrade pip
backend-api/.venv/Scripts/python.exe -m pip install -r backend-api/requirements.txt
```

## Run locally

```powershell
Set-Location backend-api
.venv/Scripts/python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The service runs at `http://localhost:8000`.

## Health check

In a second PowerShell window:

```powershell
Invoke-RestMethod http://localhost:8000/health
```

Expected response:

```json
{
  "status": "healthy"
}
```

## Run tests

```powershell
Set-Location backend-api
.venv/Scripts/python.exe -m unittest discover -s tests -p "test_*.py"
```
