# GitHub Actions Setup Guide

This project uses GitHub Actions to automatically build, test, and publish Docker images.

## Workflows

### 1. `build-and-test.yml` - Continuous Integration

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main`
- Manual dispatch

**What it does:**
- Builds Docker images for backend and frontend
- Pushes images to GitHub Container Registry (GHCR)
- Starts all services (database, backend, frontend)
- Runs health checks
- Tests API endpoints
- Supports multi-platform builds (amd64, arm64)

**Status:** Check at https://github.com/sfdxb7/expense/actions

### 2. `coolify-deploy.yml` - Coolify Deployment

**Triggers:**
- Push to `main` branch
- Manual dispatch

**What it does:**
- Builds optimized Docker images
- Pushes to GitHub Container Registry
- Tags images as `latest` and with commit SHA
- Signals Coolify that deployment can proceed

**Usage with Coolify:**
Set this URL in Coolify's GitHub Actions integration:
```
https://github.com/sfdxb7/expense/actions/workflows/coolify-deploy.yml
```

## GitHub Container Registry

### Viewing Images

Your built images are available at:
- Backend: `ghcr.io/sfdxb7/expense-tracker-backend:latest`
- Frontend: `ghcr.io/sfdxb7/expense-tracker-frontend:latest`

View packages: https://github.com/sfdxb7/expense/packages

### Making Images Public

To allow Coolify to pull images without authentication:

1. Go to https://github.com/sfdxb7/expense/packages
2. Click on `expense-tracker-backend`
3. Click "Package settings" (bottom right)
4. Scroll to "Danger Zone"
5. Click "Change visibility" → "Public"
6. Confirm the change
7. Repeat for `expense-tracker-frontend`

### Using Private Images

If you prefer to keep images private:

1. Create a GitHub Personal Access Token (PAT):
   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scope: `read:packages`
   - Generate and copy the token

2. In Coolify:
   - Go to your application → "Registries"
   - Add registry: `ghcr.io`
   - Username: Your GitHub username (`sfdxb7`)
   - Password: Your PAT token
   - Save

## Manual Workflow Trigger

To manually trigger a build:

1. Go to https://github.com/sfdxb7/expense/actions
2. Select the workflow (e.g., "Coolify Deployment")
3. Click "Run workflow"
4. Select branch: `main`
5. Click "Run workflow"

## Troubleshooting

### Workflow Fails - Package Permissions

**Error:** `denied: permission_denied: write_package`

**Solution:**
1. Go to https://github.com/sfdxb7/expense/settings/actions
2. Scroll to "Workflow permissions"
3. Select "Read and write permissions"
4. Save

### Images Not Visible

**Error:** Can't find images after workflow succeeds

**Solution:**
1. Wait 1-2 minutes after workflow completes
2. Check https://github.com/sfdxb7/expense/packages
3. If still not visible, check workflow logs for errors

### Coolify Can't Pull Images

**Error:** `unauthorized: authentication required`

**Solution:** Make images public (see "Making Images Public" above) or add registry credentials in Coolify.

### Build Cache Issues

**Error:** Old files persist in builds

**Solution:**
1. Go to workflow run
2. Click "Re-run jobs"
3. Select "Re-run all jobs"
4. Cache will be refreshed

## Local Testing

To test the built images locally:

```bash
# Pull images
docker pull ghcr.io/sfdxb7/expense-tracker-backend:latest
docker pull ghcr.io/sfdxb7/expense-tracker-frontend:latest

# Run using pre-built images
BACKEND_IMAGE=ghcr.io/sfdxb7/expense-tracker-backend:latest \
FRONTEND_IMAGE=ghcr.io/sfdxb7/expense-tracker-frontend:latest \
docker-compose up
```

## CI/CD Pipeline Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. Developer pushes code to GitHub                         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  2. GitHub Actions triggered automatically                  │
│     - Builds Docker images                                  │
│     - Runs tests                                            │
│     - Pushes to GHCR                                        │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Images available in GitHub Container Registry           │
│     - Tagged with commit SHA                                │
│     - Tagged as 'latest' for main branch                    │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Coolify detects successful workflow                     │
│     - Pulls latest images from GHCR                         │
│     - Deploys containers                                    │
│     - Runs health checks                                    │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Application live and running                            │
└─────────────────────────────────────────────────────────────┘
```

## Best Practices

### 1. Always Test Locally First

Before pushing:
```bash
docker-compose build
docker-compose up
# Test the application
docker-compose down
```

### 2. Use Semantic Commits

This helps track changes in workflow runs:
```bash
git commit -m "feat: add user profile page"
git commit -m "fix: resolve database connection issue"
git commit -m "chore: update dependencies"
```

### 3. Monitor Workflow Runs

Check https://github.com/sfdxb7/expense/actions regularly to ensure builds succeed.

### 4. Keep Images Clean

Old images consume storage. GitHub has limits:
- Free tier: 500 MB
- Delete old images periodically if needed

## Advanced Configuration

### Custom Image Tags

Modify `.github/workflows/coolify-deploy.yml`:

```yaml
tags: |
  type=sha,prefix={{branch}}-
  type=raw,value=latest,enable={{is_default_branch}}
  type=semver,pattern={{version}}  # Add this for version tags
```

### Multi-Stage Optimization

Images are already optimized with:
- Multi-stage builds (frontend)
- Alpine base images (small size)
- Build caching (faster builds)
- Layer optimization

### Secrets Management

Never commit secrets to GitHub. Use:
1. GitHub Secrets for CI/CD
2. Coolify Environment Variables for deployment
3. `.env` files locally (gitignored)

## Support

- GitHub Actions Docs: https://docs.github.com/en/actions
- GHCR Docs: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry
- Coolify Docs: https://coolify.io/docs
