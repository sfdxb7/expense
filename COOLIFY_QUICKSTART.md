# Quick Start: Deploy to Coolify (Self-Contained SQLite)

**Total time: ~5 minutes** | **Truly self-contained app**

This guide deploys your entire app with an embedded SQLite database - no separate database service needed!

---

## 🎯 What You'll Deploy

- ✅ Backend API with **embedded SQLite database** (Nixpacks auto-build from GitHub)
- ✅ Frontend React app (static site)
- ✅ Auto-deploy on git push
- ✅ Database is just a file stored with your app

**Everything in one app - truly self-contained!**

---

## Step 1: Deploy Backend API (3 minutes)

1. Log into **Coolify dashboard**

2. Click **"+ New Resource"** → **"Application"**

3. **Source**:
   - **Type**: **"GitHub App"** (connect your GitHub)
   - **Repository**: `sfdxb7/expense` (or your fork)
   - **Branch**: `main`
   - ⚠️ **Base Directory**: `/backend` **(CRITICAL for monorepo!)**

4. **Build Pack**:
   - Should auto-select **Nixpacks** ✅

5. **General**:
   - **Name**: `expense-tracker-backend`
   - **Port**: `3000`
   - **Domain**: Set your domain (e.g., `api.yourdomain.com`)

6. **Persistent Storage** ⚠️ **IMPORTANT for SQLite!**
   - Click **"Storage"** tab
   - Add **Persistent Storage**:
     - **Source**: `/app/prisma` (this is where SQLite database lives)
     - **Destination**: `/app/prisma`
     - This ensures your database survives deployments!

7. **Environment Variables** - Add these:

   ```bash
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=file:./prisma/production.db
   JWT_SECRET=GENERATE_THIS_BELOW
   FRONTEND_URL=https://your-frontend-domain.com
   ```

   **Generate JWT_SECRET** (run locally):
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

8. **Advanced** (optional):
   - **Auto Deploy**: ✅ Enable
   - **Health Check Path**: `/health`

9. Click **"Deploy"**

10. **Watch logs** - should see:
    ```
    ✓ Nixpacks build
    ✓ Prisma migrations (creating SQLite database)
    ✓ Server started
    ```

11. **Test**: `https://your-backend-domain.com/health` → `{"status":"ok"}`

✅ **Backend live with embedded database!**

---

## Step 2: Deploy Frontend (2 minutes)

1. Click **"+ New Resource"** → **"Application"**

2. **Source**:
   - **Type**: **"GitHub App"**
   - **Repository**: Same repo
   - **Branch**: `main`
   - ⚠️ **Base Directory**: `/frontend` **(CRITICAL!)**

3. **Build Pack**: **Nixpacks**

4. **General**:
   - **Name**: `expense-tracker-frontend`
   - ⚠️ **Is Static Site?**: ✅ **YES**
   - **Port**: `80` (auto-set)
   - ⚠️ **Publish Directory**: `dist`
   - **Domain**: `app.yourdomain.com`

5. **Environment Variables**:
   ```bash
   VITE_API_URL=https://your-backend-domain.com
   ```

6. **Advanced**:
   - **Auto Deploy**: ✅ Enable

7. Click **"Deploy"**

8. Visit your domain → See login page!

✅ **Frontend live!**

---

## Step 3: Create Admin User (1 minute)

### Option A: Use Backend Terminal in Coolify

1. Go to backend app → **"Terminal"** tab
2. Run:
   ```bash
   node scripts/createUser.js
   ```
3. Follow prompts

### Option B: Direct Database Access

1. Go to backend app → **"Terminal"** tab
2. Run:
   ```bash
   cd prisma
   sqlite3 production.db
   ```
3. Execute (generate hash first locally):
   ```sql
   -- Generate hash first on your machine:
   -- node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('admin123', 10));"

   INSERT INTO User (username, email, password, createdAt, updatedAt)
   VALUES ('admin', 'admin@example.com', '$2a$10$...YOUR_HASH...', datetime('now'), datetime('now'));
   ```

✅ **User created!**

---

## Step 4: Login & Test

1. Visit frontend domain
2. Login with your credentials
3. Create a property
4. Add an expense
5. Upload a receipt

🎉 **Everything works!**

---

## 📊 Architecture

```
┌─────────────────────────────────┐
│      Your Coolify Instance      │
│                                 │
│  ┌────────────────────────┐    │
│  │  Backend API (Node.js) │    │
│  │  /backend from GitHub  │    │
│  │                        │    │
│  │  📁 SQLite Database    │    │
│  │  (production.db file)  │    │
│  └────────────────────────┘    │
│              ↑                  │
│              │                  │
│  ┌────────────────────────┐    │
│  │  Frontend (React)      │    │
│  │  /frontend from GitHub │    │
│  └────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
          ↑
          │ Auto-deploy on push
          │
    GitHub Repository
```

**Database is just a file inside the backend container!**

---

## 🔄 Auto-Deploy Workflow

1. Push code to GitHub `main` branch
2. Coolify webhook triggers
3. Nixpacks rebuilds changed apps
4. Database file persists through deployments (persistent storage)
5. Zero downtime ✅

---

## 💾 Database Backups

Since your database is just a file, backing up is simple:

1. Go to backend app → **"Terminal"**
2. Run:
   ```bash
   cp prisma/production.db prisma/production.db.backup-$(date +%Y%m%d)
   ```

Or download the file:
1. Go to backend app → **"Files"**
2. Navigate to `/app/prisma/production.db`
3. Download it

**Restore**: Just upload the backup file back!

---

## 🐛 Quick Troubleshooting

### Database file disappears after deploy

**Problem**: Persistent storage not mounted

**Fix**:
1. Go to backend app → **"Storage"** tab
2. Add persistent storage:
   - Source: `/app/prisma`
   - Destination: `/app/prisma`
3. Redeploy

### Frontend can't reach backend (CORS)

**Error in browser**: `blocked by CORS`

**Fix**:
- Check backend `FRONTEND_URL` matches frontend domain exactly
- Include protocol: `https://app.yourdomain.com`
- Redeploy backend

### Migrations fail

**Fix**:
1. Go to backend → Terminal
2. Run: `npx prisma migrate deploy`
3. Check logs for specific error

---

## 🔐 Security Checklist

- ✅ Strong JWT_SECRET (64+ chars)
- ✅ NODE_ENV=production
- ✅ HTTPS enabled for frontend and backend
- ✅ CORS properly configured
- ✅ Database file in persistent storage
- ✅ Regular backups of SQLite database file

---

## 📈 Advantages of SQLite

| Feature | SQLite ✅ | PostgreSQL |
|---------|----------|------------|
| Setup | One file | Separate service |
| Backups | Copy file | pg_dump required |
| Migrations | Built-in | Built-in |
| Complexity | Very simple | Medium |
| Performance | Great for <100k records | Better for millions |
| Cost | Free (no extra service) | Free but needs resources |

**Perfect for:** Small to medium apps, single-server deployments, simple setups

---

## ✅ Deployment Checklist

- [ ] Backend deployed (base dir: `/backend`)
- [ ] Backend persistent storage mounted (`/app/prisma`)
- [ ] Backend env vars set (DATABASE_URL, JWT_SECRET, FRONTEND_URL)
- [ ] Backend health check passing
- [ ] Frontend deployed (base dir: `/frontend`, static site)
- [ ] Frontend env var `VITE_API_URL` set
- [ ] Admin user created
- [ ] Login works
- [ ] Auto-deploy enabled
- [ ] Database backup strategy in place

---

**Your self-contained app is now live! 🚀**

No external database, no separate services - just your app with an embedded SQLite database!

For detailed documentation, see `COOLIFY_DEPLOYMENT.md`
