# Quick Start: Deploy to Coolify (All-in-One)

**Total time: ~10 minutes** | **Everything runs in Coolify**

This guide deploys your entire stack (database, backend, frontend) within Coolify using Nixpacks.

---

## 🎯 What You'll Deploy

- ✅ PostgreSQL database in Coolify
- ✅ Backend API in Coolify (Nixpacks auto-build from GitHub)
- ✅ Frontend React app in Coolify (static site)
- ✅ Auto-deploy on git push

**Everything stays in your Coolify instance!**

---

## Step 1: Create PostgreSQL Database (2 minutes)

1. Log into **Coolify dashboard**

2. Click **"+ New Resource"** → **"Database"** → **"PostgreSQL"**

3. Configure:
   - **Name**: `expensetracker-db`
   - **PostgreSQL Version**: `16` (or 15)
   - **Database Name**: `expensetracker`
   - **Username**: `postgres`
   - **Password**: Click **"Generate"** (it will create a secure password)
   - **Public Port**: Leave empty (keep it internal for security)

4. Click **"Save"**

5. **Copy the password** that was generated - you'll need it in Step 2!

6. Your database connection string is:
   ```
   postgresql://postgres:YOUR_GENERATED_PASSWORD@expensetracker-db:5432/expensetracker
   ```
   Replace `YOUR_GENERATED_PASSWORD` with the password from step 5.

✅ **Database created!** It's running in Coolify and only accessible internally.

---

## Step 2: Deploy Backend API (4 minutes)

1. In Coolify, click **"+ New Resource"** → **"Application"**

2. **Source**:
   - **Type**: **"GitHub App"** (connect your GitHub)
   - **Repository**: `sfdxb7/expense` (or your fork)
   - **Branch**: `main`
   - ⚠️ **Base Directory**: `/backend` **(CRITICAL for monorepo!)**

3. **Build Pack**:
   - Should auto-select **Nixpacks** ✅

4. **General**:
   - **Name**: `expense-tracker-backend`
   - **Port**: `3000`
   - **Domain**: Set your domain (e.g., `api.yourdomain.com`)

5. **Environment Variables** - Add these:

   ```bash
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD_FROM_STEP1@expensetracker-db:5432/expensetracker
   JWT_SECRET=GENERATE_THIS_BELOW
   FRONTEND_URL=https://your-frontend-domain.com
   ```

   **Generate JWT_SECRET** (run locally):
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

6. **Advanced** (optional):
   - **Auto Deploy**: ✅ Enable
   - **Health Check Path**: `/health`

7. Click **"Deploy"**

8. **Watch logs** - should see:
   ```
   ✓ Nixpacks build
   ✓ Prisma migrations
   ✓ Server started
   ```

9. **Test**: `https://your-backend-domain.com/health` → `{"status":"ok"}`

✅ **Backend live!**

---

## Step 3: Deploy Frontend (3 minutes)

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

## Step 4: Create Admin User (1 minute)

### Option A: Use Backend Terminal in Coolify

1. Go to backend app → **"Terminal"** tab
2. Run:
   ```bash
   node scripts/createUser.js
   ```
3. Follow prompts

### Option B: Direct Database Access

1. Go to database → **"Terminal"** tab
2. Run:
   ```bash
   psql -U postgres -d expensetracker
   ```
3. Execute:
   ```sql
   -- Generate hash first (locally):
   -- node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('admin123', 10));"

   INSERT INTO "User" (username, email, password, "createdAt", "updatedAt")
   VALUES ('admin', 'admin@example.com', '$2a$10$...YOUR_HASH...', NOW(), NOW());
   ```

✅ **User created!**

---

## Step 5: Login & Test

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
│  │  PostgreSQL Database   │    │
│  │  expensetracker-db     │    │
│  └────────────────────────┘    │
│              ↑                  │
│              │                  │
│  ┌────────────────────────┐    │
│  │  Backend API (Node.js) │    │
│  │  /backend from GitHub  │    │
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

**All services communicate internally via Docker network!**

---

## 🔄 Auto-Deploy Workflow

1. Push code to GitHub `main` branch
2. Coolify webhook triggers
3. Nixpacks rebuilds changed apps:
   - Changes in `/backend` → rebuild backend only
   - Changes in `/frontend` → rebuild frontend only
4. Health checks pass
5. Traffic switches to new version
6. Zero downtime ✅

---

## 🐛 Quick Troubleshooting

### Backend can't connect to database

**Error**: `Can't reach database server`

**Fix**:
- Check `DATABASE_URL` uses service name: `expensetracker-db`
- Verify password matches database password
- Both must be in same Coolify project (same Docker network)

### Frontend can't reach backend (CORS)

**Error in browser**: `blocked by CORS`

**Fix**:
- Check backend `FRONTEND_URL` matches frontend domain exactly
- Include protocol: `https://app.yourdomain.com`
- Redeploy backend after changing

### Migrations fail

**Error**: `Migration engine error`

**Fix**:
1. Go to backend → Terminal
2. Run: `npx prisma migrate deploy`
3. Check logs for specific error

---

## 🔐 Security Checklist

- ✅ Database has no public port (internal only)
- ✅ Strong JWT_SECRET (64+ chars)
- ✅ Database password auto-generated by Coolify
- ✅ HTTPS enabled for frontend and backend
- ✅ CORS properly configured
- ✅ NODE_ENV=production

---

## 📈 What's Next?

- [ ] Set up database backups in Coolify
- [ ] Configure monitoring/alerts
- [ ] Add SSL certificates for custom domains
- [ ] Review resource limits
- [ ] Set up staging environment

---

## ✅ Deployment Checklist

- [ ] Database created in Coolify
- [ ] Database password saved
- [ ] Backend deployed (base dir: `/backend`)
- [ ] Backend env vars set
- [ ] Backend health check passing
- [ ] Frontend deployed (base dir: `/frontend`, static site)
- [ ] Frontend env var `VITE_API_URL` set
- [ ] Admin user created
- [ ] Login works
- [ ] Auto-deploy enabled

---

**Everything is now running in your Coolify instance! 🚀**

For detailed documentation, see `COOLIFY_DEPLOYMENT.md`
