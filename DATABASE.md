# Database Setup (PostgreSQL Native)

This backend uses **native PostgreSQL** (via `pg` driver) instead of Prisma for better performance and fewer dependencies.

## Environment Variables

Create a `.env` file with:

```bash
DATABASE_URL="postgresql://user:password@host:port/database"
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
LOG_QUERIES=false
```

## Database Initialization

### Option 1: Using the init script (Recommended)

```bash
# Build the TypeScript first
npm run build

# Initialize the database schema
npm run db:init
```

### Option 2: Manually with psql

```bash
psql $DATABASE_URL < src/db/init.sql
```

### Option 3: Using any PostgreSQL client

Copy the contents of `src/db/init.sql` and execute it in your PostgreSQL client.

## Database Schema

### Tables

#### `rejection_cases`
- Stores all rejection case information
- Primary key: `codigo_sc` (unique)
- Auto-updated `updated_at` timestamp via trigger

#### `case_events`
- Stores timeline events for each case
- Foreign key: `case_id` references `rejection_cases(codigo_sc)`
- Cascade delete: when a case is deleted, all its events are deleted

### Indexes

- `idx_rejection_cases_codigo_sc`: Fast lookups by case ID
- `idx_rejection_cases_status`: Fast filtering by status
- `idx_rejection_cases_created_at`: Fast sorting by creation date
- `idx_case_events_case_id`: Fast event retrieval by case
- `idx_case_events_timestamp`: Fast event sorting

## Migration Strategy

For schema changes:

1. Update `src/db/init.sql`
2. Run `npm run db:init` to recreate tables (⚠️ **development only**)

For production:
- Write migration SQL scripts manually
- Apply them carefully with proper backup procedures

## Connection Pooling

The application uses `pg.Pool` for efficient database connections:

- Connection string from `DATABASE_URL`
- SSL enabled automatically in production
- Auto-reconnect on connection errors
- Query logging (enable with `LOG_QUERIES=true`)

## No More Prisma Issues!

✅ No OpenSSL dependencies
✅ No binary compilation issues
✅ Faster startup time
✅ Smaller Docker images
✅ More control over queries
✅ Native PostgreSQL features
