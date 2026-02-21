#!/bin/bash
# Backup PostgreSQL from the Docker container.
# Usage: ./scripts/backup-database.sh [output_file]
# Default output: prisma/backups/recipe-chat-YYYYMMDD-HHMMSS.sql

set -e
DB_CONTAINER_NAME="recipe-chat-postgres"

# Load DB connection from .env (support .env.local)
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

# Parse DATABASE_URL for user and dbname (or use env / defaults)
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
if [ -n "$DATABASE_URL" ]; then
  DB_USER="${DB_USER:-$(echo "$DATABASE_URL" | sed -n 's|.*://\([^:]*\):.*|\1|p')}"
  DB_NAME="${DB_NAME:-$(echo "$DATABASE_URL" | sed -n 's|.*/\([^/?]*\).*|\1|p')}"
fi
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-recipe-chat}"

BACKUP_DIR="prisma/backups"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
OUTPUT_FILE="${1:-$BACKUP_DIR/recipe-chat-$TIMESTAMP.sql}"

echo "Backing up database '$DB_NAME' to $OUTPUT_FILE ..."
docker exec "$DB_CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" --no-owner --no-acl > "$OUTPUT_FILE"
echo "Done. Backup saved to $OUTPUT_FILE"
