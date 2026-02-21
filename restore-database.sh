#!/bin/bash
# Restore PostgreSQL from a backup file into the Docker container.
# The container must already be running (e.g. new pgvector container).
# Usage: ./scripts/restore-database.sh <backup.sql>

set -e
if [ -z "$1" ] || [ ! -f "$1" ]; then
  echo "Usage: ./scripts/restore-database.sh <backup.sql>"
  echo "Example: ./scripts/restore-database.sh prisma/backups/recipe-chat-20260213-120000.sql"
  exit 1
fi
BACKUP_FILE="$1"
DB_CONTAINER_NAME="recipe-chat-postgres"

# Load DB connection from .env
if [ -f .env.local ]; then
  set -a
  source .env.local
  set +a
elif [ -f .env ]; then
  set -a
  source .env
  set +a
else
  echo "No .env or .env.local found"
  exit 1
fi

if [ -n "$DATABASE_URL" ]; then
  DB_USER="${DB_USER:-$(echo "$DATABASE_URL" | sed -n 's|.*://\([^:]*\):.*|\1|p')}"
  DB_NAME="${DB_NAME:-$(echo "$DATABASE_URL" | sed -n 's|.*/\([^/?]*\).*|\1|p')}"
fi
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-recipe-chat}"

if ! docker ps -q -f name="$DB_CONTAINER_NAME" | grep -q .; then
  echo "Container $DB_CONTAINER_NAME is not running. Start it first with ./start-database.sh"
  exit 1
fi

echo "Restoring '$DB_NAME' from $BACKUP_FILE ..."
docker exec -i "$DB_CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" < "$BACKUP_FILE"
echo "Restore finished."
