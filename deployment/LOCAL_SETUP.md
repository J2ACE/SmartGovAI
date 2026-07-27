# Phase 1: local database setup

This configuration starts only PostgreSQL with the PostGIS extension. It deliberately does not start the old Express backend, Redis, AI prototype, WhatsApp service, or web application.

## Prerequisite

Install and start Docker Desktop. Confirm that it is running before continuing.

## Start the database

From the repository root in PowerShell:

```powershell
Copy-Item deployment/.env.example deployment/.env
docker compose --env-file deployment/.env -f deployment/docker-compose.local.yml up -d
docker compose --env-file deployment/.env -f deployment/docker-compose.local.yml ps
```

Expected result: the `smartgovai-postgres-local` container reports `healthy` and listens on `localhost:5432`.

## Verify PostGIS

```powershell
docker compose --env-file deployment/.env -f deployment/docker-compose.local.yml exec postgres psql -U smartgov -d smartgovai -c "SELECT PostGIS_Version();"
```

Expected result: a PostGIS version is printed.

## Stop the database

```powershell
docker compose --env-file deployment/.env -f deployment/docker-compose.local.yml down
```

Do not use `down -v` unless you intentionally want to delete all local database data.
