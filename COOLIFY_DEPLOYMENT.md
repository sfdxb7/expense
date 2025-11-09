# Coolify Deployment Guide

This guide will help you deploy the Expense Tracker application to Coolify.

## Prerequisites

- A Coolify instance (self-hosted or managed)
- Git repository (GitHub, GitLab, or Bitbucket)
- Domain name (optional but recommended)

## Quick Start

### 1. Prepare Your Repository

Ensure all files are committed and pushed to your Git repository:

```bash
git add .
git commit -m "Prepare for Coolify deployment"
git push origin main
```

### 2. Connect to Coolify

1. Log into your Coolify dashboard
2. Click "Add New Resource" → "New Application"
3. Select "Docker Compose" as the build pack
4. Connect your Git repository

### 3. Configure Environment Variables

In Coolify, navigate to your project's Environment Variables section and set the following:

#### Required Variables

```bash
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<generate-secure-password>
POSTGRES_DB=expensetracker

# JWT Secret (CRITICAL - generate a strong random string)
JWT_SECRET=<generate-secure-jwt-secret>

# Node Environment
NODE_ENV=production
```

#### Production URLs

```bash
# Replace with your actual domain
FRONTEND_URL=https://your-domain.com

# If Coolify assigns different URLs
BACKEND_URL=https://api.your-domain.com
```

#### Optional Overrides

```bash
# Custom ports (usually not needed in Coolify)
BACKEND_PORT=3001
FRONTEND_PORT=3333
```

### 4. Generate Secure Secrets

Generate secure random strings for sensitive variables:

```bash
# For JWT_SECRET (Node.js)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# For POSTGRES_PASSWORD
openssl rand -hex 32
```

### 5. Configure Domain (Optional)

1. In Coolify, go to your application settings
2. Under "Domains", add your custom domain:
   - Frontend: `your-domain.com`
   - Backend API: `api.your-domain.com` (optional)
3. Coolify will automatically handle SSL/TLS certificates

### 6. Deploy

1. Click "Deploy" in Coolify
2. Monitor the build logs
3. Wait for all services to become healthy (green status)

## Configuration Details

### Service Ports

- **Frontend**: Port 80 (nginx) → Coolify will map to HTTPS
- **Backend**: Port 3000 (Express API)
- **Database**: Port 5432 (PostgreSQL, internal only)

### Health Checks

All services include health checks:

- **Database**: `pg_isready` check every 10s
- **Backend**: HTTP check on `/health` endpoint every 30s
- **Frontend**: HTTP check on nginx every 30s

### Persistent Storage

Two volumes are configured for data persistence:

- `postgres_data`: Database storage
- `uploads`: User-uploaded receipts (20MB limit)

## Post-Deployment

### Create Your First User

Since public registration is disabled, you need to manually create users:

```bash
# Access the backend container via Coolify terminal
docker exec -it <backend-container-name> sh

# Run the user creation script
node scripts/createUser.js

# Follow the prompts to create a user
```

Or use direct database access (see [USER_MANAGEMENT.md](USER_MANAGEMENT.md) for details).

### Verify Deployment

1. Visit your frontend URL: `https://your-domain.com`
2. Test login with your created user
3. Check that file uploads work (receipts)
4. Verify all features work correctly

## Troubleshooting

### Build Failures

**Issue**: Build fails during npm install

**Solution**: Clear Coolify's build cache and redeploy

```bash
# In Coolify, go to Settings → Advanced → Clear Build Cache
```

### Database Connection Issues

**Issue**: Backend can't connect to database

**Solution**: Check these environment variables:

- `DATABASE_URL` must match `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB`
- Format: `postgresql://<user>:<password>@db:5432/<database>`

### CORS Errors

**Issue**: Frontend can't communicate with backend

**Solution**: Update `FRONTEND_URL` in backend environment variables:

```bash
FRONTEND_URL=https://your-actual-domain.com
```

### File Upload 413 Errors

**Issue**: Large file uploads fail

**Solution**: The limit is set to 20MB. If needed, adjust in:
- [backend/src/middleware/upload.js](backend/src/middleware/upload.js#L43)
- [backend/src/server.js](backend/src/server.js#L23-L24)
- [frontend/nginx.conf](frontend/nginx.conf#L9)

### Container Health Check Failures

**Issue**: Services keep restarting

**Solution**:

1. Check Coolify logs for specific errors
2. Verify all environment variables are set
3. Ensure database is ready before backend starts (health check dependency)

## Coolify-Specific Features

### Auto-Deploy on Push

Enable in Coolify settings:
1. Go to Application Settings
2. Enable "Auto Deploy"
3. Choose branch (e.g., `main`)
4. Every push will trigger automatic deployment

### Zero-Downtime Deployments

Coolify supports rolling updates:
1. New containers start
2. Health checks pass
3. Old containers are terminated
4. No service interruption

### Monitoring

Coolify provides:
- Real-time container logs
- Resource usage (CPU, Memory)
- Service status dashboard
- Automatic restarts on failures

## Security Checklist

Before going live, ensure:

- [ ] Strong `JWT_SECRET` is set (64+ character random string)
- [ ] Strong `POSTGRES_PASSWORD` is set
- [ ] `FRONTEND_URL` is set to your actual production domain
- [ ] `NODE_ENV=production` is set
- [ ] SSL/TLS certificates are active (Coolify handles this)
- [ ] Database is not publicly accessible
- [ ] File upload limits are appropriate (20MB default)

## Backup Strategy

### Database Backups

Coolify may offer automated backups. Alternatively:

```bash
# Manual backup via Coolify terminal
docker exec <db-container> pg_dump -U postgres expensetracker > backup.sql

# Download via Coolify file manager
```

### Uploaded Files Backup

The `uploads` volume contains user receipts. Consider:
- Coolify's volume backup feature
- Manual exports via terminal
- S3/object storage integration (requires code changes)

## Scaling Considerations

For high traffic:

1. **Database**: Upgrade to Coolify's managed PostgreSQL or external service
2. **Backend**: Increase container resources in Coolify settings
3. **Frontend**: nginx handles static files efficiently (no changes needed)
4. **Uploads**: Consider moving to S3/R2 for larger scale

## Support

For Coolify-specific issues:
- Coolify Documentation: https://coolify.io/docs
- Coolify Community: https://discord.gg/coolify

For application issues:
- Review application logs in Coolify
- Check [USER_MANAGEMENT.md](USER_MANAGEMENT.md) for user management
- Verify environment variables are correctly set

## Update Procedure

To deploy updates:

1. Push changes to your Git repository
2. In Coolify, click "Deploy" (or auto-deploys if enabled)
3. Monitor build and deployment logs
4. Database migrations run automatically via Prisma
5. Verify functionality after deployment

---

**Ready to deploy?** Follow the steps above and your Expense Tracker will be live in minutes!
