# Coolify Deployment Guide - ExpenseTracker

This guide shows you how to deploy the ExpenseTracker application to Coolify using **Nixpacks** (automatic builds from GitHub).

## 🎯 What is Nixpacks?

Nixpacks is an automatic build system that:
- ✅ Detects your application type (Node.js, React, etc.)
- ✅ Automatically generates build configurations
- ✅ No Dockerfile needed!
- ✅ Works directly from your GitHub repository
- ✅ Simpler than Docker for most use cases

## 📋 Prerequisites

1. **Coolify instance** running (self-hosted or cloud)
2. **GitHub repository** with your code
3. That's it! Database will be created in Coolify

## 🚀 Deployment Steps

### Step 1: Create PostgreSQL Database in Coolify

1. Go to your **Coolify dashboard**
2. Click **"+ New Resource"** → **"Database"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `expensetracker-db`
   - **PostgreSQL Version**: 15 or 16
   - **Database Name**: `expensetracker`
   - **Username**: `postgres` (default is fine)
   - **Password**: Click "Generate" or set your own secure password
   - **Public Port**: Leave empty (internal only for security)
4. Click **"Save"**
5. Coolify will automatically:
   - ✅ Create the database container
   - ✅ Set up persistent storage
   - ✅ Configure health checks
   - ✅ Generate internal connection details

6. **Get the connection string**:
   - In the database details page, you'll see connection info
   - The **internal connection string** format:
     ```
     postgresql://postgres:YOUR_PASSWORD@expensetracker-db:5432/expensetracker
     ```
   - **Important**: Use the service name `expensetracker-db` as the hostname (internal Docker network)
   - Save this connection string for Step 2

**Note**: The database is only accessible from inside Coolify's internal network - your backend will connect to it using the service name.

---

### Step 2: Deploy Backend API

1. Click **"+ New Resource"** → **"Application"**
2. **Source Configuration**:
   - Choose **"GitHub App"** (recommended) or **"Public Repository"**
   - Select your repository: `sfdxb7/expense` (or your fork)
   - **Branch**: `main`
   - **Base Directory**: `/backend` ⚠️ **Important for monorepo!**

3. **Build Pack**:
   - Coolify will auto-select **Nixpacks** ✅
   - If not, manually select **Nixpacks**

4. **General Settings**:
   - **Name**: `expense-tracker-backend`
   - **Port**: `3000` (this is where your Express server listens)
   - **Domain**: Add your backend domain (e.g., `api.yourdomain.com`)
   - Or use Coolify's generated domain

5. **Environment Variables** (click "Environment Variables" tab):

   Add these variables:

   ```bash
   NODE_ENV=production
   PORT=3000

   # Database - Use connection string from Step 1
   # Replace YOUR_DB_PASSWORD with the password from your Coolify database
   DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@expensetracker-db:5432/expensetracker

   # JWT Secret (generate a secure random string)
   JWT_SECRET=<generate-using-command-below>

   # CORS - Set to your frontend domain
   FRONTEND_URL=https://your-frontend-domain.com
   ```

   **Generate JWT_SECRET**:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

6. **Advanced Settings** (optional):
   - **Auto Deploy**: Enable to deploy on every git push
   - **Health Check Path**: `/health`
   - **Health Check Interval**: 30s

7. Click **"Deploy"**

8. **Verify Deployment**:
   - Check logs for successful migration: `npx prisma migrate deploy`
   - Visit `https://your-backend-domain.com/health` - should return `{ "status": "ok" }`

---

### Step 3: Deploy Frontend

1. Click **"+ New Resource"** → **"Application"**
2. **Source Configuration**:
   - Choose **"GitHub App"** or **"Public Repository"**
   - Select the same repository
   - **Branch**: `main`
   - **Base Directory**: `/frontend` ⚠️ **Important for monorepo!**

3. **Build Pack**:
   - Select **Nixpacks**

4. **General Settings**:
   - **Name**: `expense-tracker-frontend`
   - **Is it a static site?**: ✅ **YES** (Enable this!)
   - **Port**: `80` (auto-set for static sites)
   - **Publish Directory**: `dist` ⚠️ **Important!**
   - **Domain**: Add your frontend domain (e.g., `app.yourdomain.com`)

5. **Environment Variables** (Build Time):

   ```bash
   # API URL - use your backend domain from Step 2
   VITE_API_URL=https://api.yourdomain.com
   ```

   **Note**: Vite build-time variables must start with `VITE_`

6. **Advanced Settings**:
   - **Auto Deploy**: Enable
   - **Static Site Web Server**: Nginx (default)

7. Click **"Deploy"**

8. **Verify Deployment**:
   - Visit your frontend domain
   - You should see the login page
   - Check browser console for API connection errors

---

### Step 4: Create Your First User

Since registration is disabled, you need to create a user manually.

**Option 1: Using Coolify Database Terminal**

1. Go to your PostgreSQL database in Coolify
2. Click **"Terminal"** or **"Execute Command"**
3. Run:
   ```bash
   psql -U postgres -d expensetracker
   ```
4. In the SQL prompt:
   ```sql
   -- Generate password hash (use bcrypt online tool or run locally)
   -- Example with password "admin123"
   INSERT INTO "User" (username, email, password, "createdAt", "updatedAt")
   VALUES (
     'admin',
     'admin@example.com',
     '$2a$10$XYZ...', -- Replace with actual bcrypt hash
     NOW(),
     NOW()
   );
   ```

**Option 2: Using Backend Container Terminal**

1. Go to your backend application in Coolify
2. Click **"Terminal"**
3. Run:
   ```bash
   node scripts/createUser.js
   ```
4. Follow the prompts to create a user

**Generate bcrypt hash** (on your local machine):
```bash
cd backend
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your-password', 10));"
```

---

## 🔧 Configuration Files Explained

### `backend/nixpacks.toml`
```toml
[phases.setup]
nixPkgs = ["nodejs-18_x", "openssl"]  # Install Node.js 18 and OpenSSL

[phases.install]
cmds = ["npm ci --production=false"]   # Install all dependencies

[phases.build]
cmds = ["npx prisma generate"]         # Generate Prisma client

[start]
cmd = "npx prisma migrate deploy && node src/server.js"  # Run migrations then start
```

### `frontend/nixpacks.toml`
```toml
[phases.setup]
nixPkgs = ["nodejs-18_x"]              # Install Node.js 18

[phases.install]
cmds = ["npm ci"]                      # Install dependencies

[phases.build]
cmds = ["npm run build"]               # Build React app

[start]
staticAssets = { dir = "dist" }        # Serve static files from dist/
```

---

## 🔄 Automatic Deployments (CI/CD)

### Enable GitHub Auto-Deploy

1. In both frontend and backend apps, go to **"Settings"**
2. Enable **"Auto Deploy"**
3. Now every push to `main` branch will:
   - ✅ Pull latest code
   - ✅ Run Nixpacks build
   - ✅ Deploy automatically
   - ✅ Zero downtime (health checks)

### Deployment Workflow

```
1. You push code to GitHub
   ↓
2. Coolify detects the push (webhook)
   ↓
3. Nixpacks analyzes your code
   ↓
4. Builds backend/frontend separately (based on Base Directory)
   ↓
5. Runs health checks
   ↓
6. Switches traffic to new version
   ↓
7. Done! ✅
```

---

## 📊 Monitoring & Logs

### View Logs

**Backend Logs**:
1. Go to backend app in Coolify
2. Click **"Logs"** tab
3. See real-time logs from Express server

**Frontend Logs**:
1. Go to frontend app
2. Click **"Logs"** tab
3. See Nginx access/error logs

### Health Checks

Coolify automatically monitors:
- **Backend**: `GET /health` every 30s
- **Frontend**: HTTP 200 check every 30s
- **Database**: PostgreSQL connection check

If health check fails, Coolify alerts you and can auto-restart.

---

## 🐛 Troubleshooting

### Backend Won't Start

**Check logs for common issues:**

1. **Database connection error**:
   ```
   Error: Can't reach database server
   ```
   **Fix**: Verify `DATABASE_URL` in environment variables
   - Make sure hostname is the database service name (e.g., `expensetracker-db`)
   - Check password is correct

2. **Missing JWT_SECRET**:
   ```
   Error: JWT_SECRET is not defined
   ```
   **Fix**: Add `JWT_SECRET` to environment variables

3. **Port binding error**:
   ```
   Error: Port 3000 already in use
   ```
   **Fix**: Make sure Port setting in Coolify is `3000`

### Frontend Build Fails

1. **Missing VITE_API_URL**:
   ```
   Warning: VITE_API_URL not defined
   ```
   **Fix**: Add `VITE_API_URL` to build-time environment variables

2. **Wrong publish directory**:
   - Make sure **Publish Directory** is set to `dist`
   - Check **"Is it a static site?"** is enabled

### CORS Errors

**Error in browser console**:
```
Access to fetch at 'https://api.example.com' has been blocked by CORS
```

**Fix**:
1. Go to backend app environment variables
2. Set `FRONTEND_URL=https://your-frontend-domain.com`
3. Redeploy backend

### Database Migration Errors

**If migrations fail on deployment**:

1. Go to backend app terminal in Coolify
2. Run manually:
   ```bash
   npx prisma migrate deploy
   ```
3. Check for migration errors in logs

---

## 🔐 Security Checklist

Before going to production:

- ✅ Change default PostgreSQL password
- ✅ Generate strong `JWT_SECRET` (64+ characters)
- ✅ Set `NODE_ENV=production`
- ✅ Set correct `FRONTEND_URL` for CORS
- ✅ Enable HTTPS on both frontend and backend domains
- ✅ Create secure admin user password
- ✅ Review Coolify firewall settings
- ✅ Enable auto-backups for PostgreSQL database

---

## 📈 Scaling & Performance

### Enable Coolify Features

1. **Auto Backups** (PostgreSQL):
   - Go to database settings
   - Enable scheduled backups
   - Choose backup retention period

2. **Resource Limits**:
   - Set memory limits for each container
   - Recommended: Backend 512MB, Frontend 256MB, DB 1GB

3. **Load Balancing** (if needed):
   - Scale backend horizontally
   - Coolify can run multiple backend instances

---

## 🆚 Nixpacks vs Docker Compose

### Why Nixpacks is Better for Your Use Case

| Feature | Nixpacks ✅ | Docker Compose |
|---------|------------|----------------|
| Configuration | Auto-detected | Manual Dockerfile |
| Monorepo Support | Native (Base Directory) | Complex setup |
| Learning Curve | Low | Medium-High |
| Build Speed | Fast (cached) | Depends on Dockerfile |
| GitHub Integration | Native | Needs CI/CD setup |
| Maintenance | Minimal | Update Dockerfiles |

**When to use Docker Compose instead**:
- Complex multi-service dependencies
- Need exact Docker control
- Custom build requirements

---

## 📚 Additional Resources

- [Coolify Nixpacks Docs](https://coolify.io/docs/applications/build-packs/nixpacks)
- [Nixpacks Documentation](https://nixpacks.com/docs)
- [Coolify Community](https://github.com/coollabsio/coolify/discussions)

---

## ✅ Quick Deployment Checklist

- [ ] PostgreSQL database created in Coolify
- [ ] Backend deployed with base directory `/backend`
- [ ] Backend environment variables set (DATABASE_URL, JWT_SECRET, FRONTEND_URL)
- [ ] Backend health check passing at `/health`
- [ ] Frontend deployed with base directory `/frontend`
- [ ] Frontend marked as static site with publish directory `dist`
- [ ] Frontend environment variable `VITE_API_URL` set
- [ ] First user created via database or script
- [ ] Login works on frontend
- [ ] Auto-deploy enabled on both apps
- [ ] HTTPS enabled for both domains

---

**Your ExpenseTracker is now live on Coolify! 🎉**

Any issues? Check the logs in Coolify dashboard or reach out for help.
