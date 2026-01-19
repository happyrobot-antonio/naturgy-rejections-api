# Railway Deployment Guide

## Environment Variables Required

Configure these in Railway's dashboard:

```bash
# Database (Railway will provide this automatically if you add a PostgreSQL service)
DATABASE_URL=postgresql://user:password@host:port/database?schema=public

# Server Configuration
PORT=4000
NODE_ENV=production

# CORS (Your frontend URL)
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

## Deployment Steps

1. **Create a new Railway project**
   ```bash
   railway init
   ```

2. **Add PostgreSQL Database**
   - In Railway dashboard, click "+ New"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically set `DATABASE_URL`

3. **Configure Environment Variables**
   - Go to your service settings
   - Add the variables listed above

4. **Deploy**
   ```bash
   railway up
   ```

## Build Configuration

The project includes:
- `railway.json` - Build and deploy configuration
- `Procfile` - Start command
- `.nvmrc` - Node.js version specification

Railway will automatically:
1. Install dependencies
2. Generate Prisma client
3. Build TypeScript
4. Run migrations
5. Start the server

## Health Check

After deployment, verify:
```bash
curl https://your-app.railway.app/api/cases/stats
```

## Common Issues

### Migrations fail
- Make sure `DATABASE_URL` is set correctly
- Check that the database is accessible

### Build fails
- Verify Node.js version (>=20.0.0)
- Check that all dependencies are in `package.json`

### App crashes on start
- Check logs: `railway logs`
- Verify all environment variables are set
