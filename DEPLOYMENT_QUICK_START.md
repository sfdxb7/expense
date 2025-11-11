# Quick Start: Deploy to Coolify

Your expense tracker is now ready for deployment with automated CI/CD!

## ✅ What's Been Set Up

1. **GitHub Actions Workflows** - Automatically build and test on every push
2. **Docker Images** - Pre-built images pushed to GitHub Container Registry
3. **Health Checks** - All services have health monitoring
4. **Coolify Configuration** - Optimized docker-compose for fast deployment

## 🚀 Deploy Now (5 Minutes)

### Step 1: Make Images Public (Easiest Option)

1. Go to https://github.com/sfdxb7/expense/packages
2. For each package (backend and frontend):
   - Click on the package
   - Click "Package settings" (bottom right)
   - Click "Change visibility" → "Public"
   - Confirm

### Step 2: Wait for Build to Complete

Check https://github.com/sfdxb7/expense/actions

- ✅ "Coolify Deployment" should complete in 2-3 minutes
- ✅ "Build and Test Docker Images" runs full tests (3-5 minutes)

### Step 3: Deploy to Coolify

1. **Log into Coolify**

2. **Create New Application:**
   - Click "+ New Resource" → "Application"
   - Select "Docker Compose"

3. **Connect Repository:**
   - Git repository: `https://github.com/sfdxb7/expense`
   - Branch: `main`
   - Docker Compose file: `docker-compose.coolify.yml` ⚠️ Important!

4. **Set Environment Variables:**
   ```bash
   # Required
   JWT_SECRET=<generate-with-command-below>
   POSTGRES_PASSWORD=<generate-with-command-below>
   FRONTEND_URL=https://your-domain.com

   # Optional
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db:5432/expensetracker
   POSTGRES_USER=postgres
   POSTGRES_DB=expensetracker
   NODE_ENV=production
   ```

   **Generate Secrets:**
   ```bash
   # For JWT_SECRET
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

   # For POSTGRES_PASSWORD
   openssl rand -hex 32
   ```

5. **Deploy:**
   - Click "Deploy"
   - Monitor logs
   - Wait for services to be healthy (2-3 minutes)

6. **Create First User:**
   ```bash
   # In Coolify terminal for backend container:
   node scripts/createUser.js
   ```

### Step 4: Access Your App

- Open `https://your-domain.com`
- Login with created user
- Start tracking expenses!

## 📚 Full Documentation

- **Coolify Setup:** [COOLIFY_DEPLOYMENT.md](COOLIFY_DEPLOYMENT.md)
- **CI/CD Details:** [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md)
- **User Management:** [USER_MANAGEMENT.md](USER_MANAGEMENT.md)
- **General Info:** [README.md](README.md)

## 🔧 Advanced: GitHub Actions Integration

To make Coolify wait for builds before deploying:

1. In Coolify application settings → "Build & Deploy"
2. Enable "GitHub Actions Integration"
3. Set URL: `https://github.com/sfdxb7/expense/actions/workflows/coolify-deploy.yml`

Now deployments will:
1. Trigger GitHub Action
2. Build and test images
3. Push to GHCR
4. Coolify pulls pre-built images
5. Fast deployment!

## 🔐 Alternative: Private Images

If you prefer private images:

1. **Create GitHub Token:**
   - https://github.com/settings/tokens
   - Scope: `read:packages`
   - Generate and copy

2. **In Coolify:**
   - Application → "Registries"
   - Add registry: `ghcr.io`
   - Username: `sfdxb7`
   - Password: Your token
   - Save

## 📊 Monitor Your Deployment

- **GitHub Actions:** https://github.com/sfdxb7/expense/actions
- **Container Images:** https://github.com/sfdxb7/expense/packages
- **Coolify Dashboard:** Your Coolify URL

## ❓ Troubleshooting

### Workflow Failed
- Check logs at https://github.com/sfdxb7/expense/actions
- Common fix: Settings → Actions → Permissions → "Read and write"

### Can't Pull Images
- Make packages public (Step 1 above)
- Or add registry credentials in Coolify

### Services Not Healthy
- Check Coolify logs
- Verify all environment variables are set
- Ensure JWT_SECRET and POSTGRES_PASSWORD are set

### Need Help?
- Read [COOLIFY_DEPLOYMENT.md](COOLIFY_DEPLOYMENT.md) for detailed troubleshooting
- Check [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md) for CI/CD issues

## 🎉 Success Checklist

- [ ] GitHub Actions workflows completed successfully
- [ ] Docker images visible at https://github.com/sfdxb7/expense/packages
- [ ] Images set to public (or registry credentials added)
- [ ] Coolify application created
- [ ] Environment variables configured
- [ ] Application deployed and healthy
- [ ] First user created
- [ ] Successfully logged in
- [ ] All features working (expenses, uploads, reports)

---

**You're ready to deploy!** 🚀

Follow the 4 steps above and you'll have your expense tracker live in minutes.
