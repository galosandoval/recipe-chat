# Database backup and restore (Docker)

Use this when switching the DB container (e.g. to the pgvector image) without losing data.

## 1. Backup

From the project root, with the current DB container **running**:

```bash
./scripts/backup-database.sh
```

Backup is written to `prisma/backups/recipe-chat-YYYYMMDD-HHMMSS.sql`.  
Or pass a path: `./scripts/backup-database.sh path/to/backup.sql`

**Manual backup** (if the script fails, e.g. due to `DATABASE_URL` format):

```bash
docker exec recipe-chat-postgres pg_dump -U postgres -d recipe-chat --no-owner --no-acl > prisma/backups/my-backup.sql
```

Use the actual database name from your `DATABASE_URL` (e.g. `recipe-chat-v1` instead of `recipe-chat`).

---

## 2. Replace the container

```bash
docker stop recipe-chat-postgres
docker rm recipe-chat-postgres
./start-database.sh
```

Wait a few seconds for Postgres to be ready.

---

## 3. Restore

```bash
./scripts/restore-database.sh prisma/backups/recipe-chat-YYYYMMDD-HHMMSS.sql
```

**Manual restore:**

```bash
docker exec -i recipe-chat-postgres psql -U postgres -d recipe-chat < prisma/backups/my-backup.sql
```

---

## 4. Run migrations (if needed)

After restore, the DB may be missing new tables (e.g. Pantry). Apply pending migrations:

```bash
npm run migrate
# or: dotenv -e .env.local -- npx prisma migrate dev
```

If a migration was already applied in the backup, Prisma will skip it. If you restored an older backup and added new migrations, they will run in step 4.
