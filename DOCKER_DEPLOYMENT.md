# Docker Deployment Guide - ExpenseTracker

Deploy the complete ExpenseTracker application using Docker Compose with embedded SQLite database.

## 🎯 What You Get

- ✅ Backend API with **embedded SQLite database** (self-contained)
- ✅ Frontend React app served by Nginx
- ✅ **No separate database container** - SQLite file is persisted in volume
- ✅ Automatic health checks
- ✅ Production-ready configuration
- ✅ One command deployment

---

## 📋 Prerequisites

- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (included with Docker Desktop)
- Git

---

## 🚀 Quick Start (3 minutes)

### Step 1: Clone and Configure

```bash
# Clone repository
git clone https://github.com/sfdxb7/expense.git
cd expense

# Copy environment file
cp .env.docker.example .env

# Edit .env and set JWT_SECRET
# Generate using: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Edit `.env` file:**
```bash
NODE_ENV=production
JWT_SECRET=your-generated-secret-here
FRONTEND_URL=http://localhost
BACKEND_PORT=3001
FRONTEND_PORT=80
VITE_API_URL=http://localhost:3001
```

### Step 2: Start Everything

```bash
# Build and start all services
docker-compose up -d

# Watch logs (optional)
docker-compose logs -f
```

**Services will start:**
1. Backend builds → Runs migrations → Starts server
2. Frontend builds → Nginx serves React app
3. Health checks verify everything is working

### Step 3: Create First User

```bash
# Access backend container
docker-compose exec backend sh

# Run user creation script
node scripts/createUser.js

# Follow prompts to create admin user
# Exit container
exit
```

### Step 4: Access Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

✅ **Done!** Login and start tracking expenses.

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────┐
│               Docker Host                       │
│                                                 │
│  ┌────────────────────────────────────────┐   │
│  │  Frontend Container                    │   │
│  │  - Nginx                               │   │
│  │  - React app (built)                   │   │
│  │  Port: 80                              │   │
│  └────────────────────────────────────────┘   │
│                    ↓                           │
│  ┌────────────────────────────────────────┐   │
│  │  Backend Container                     │   │
│  │  - Node.js + Express                   │   │
│  │  - SQLite database (volume mounted)    │   │
│  │  - Uploaded receipts (volume mounted)  │   │
│  │  Port: 3000 (mapped to 3001)           │   │
│  └────────────────────────────────────────┘   │
│                                                 │
│  Volumes:                                       │
│  - backend-data (SQLite database)              │
│  - backend-uploads (receipts)                  │
└─────────────────────────────────────────────────┘
```

---

## 🔧 Docker Compose Commands

### Start Services

```bash
# Start in background
docker-compose up -d

# Start with rebuild
docker-compose up -d --build

# Start and watch logs
docker-compose up
```

### Stop Services

```bash
# Stop all services
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove everything (including volumes - DELETES DATA!)
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Check Status

```bash
# List running containers
docker-compose ps

# Check health status
docker-compose ps
```

### Access Containers

```bash
# Backend shell
docker-compose exec backend sh

# Frontend shell
docker-compose exec frontend sh
```

---

## 💾 Database Management

### SQLite Database Location

The SQLite database is stored in a Docker volume:
- **Volume name**: `backend-data`
- **Mount point**: `/app/prisma` in backend container
- **Database file**: `/app/prisma/production.db`

### Backup Database

```bash
# Create backup
docker-compose exec backend sh -c "cp /app/prisma/production.db /app/prisma/backup-$(date +%Y%m%d).db"

# Copy backup to host
docker cp expense-tracker-backend:/app/prisma/backup-20251130.db ./backup.db
```

### Restore Database

```bash
# Copy database file to container
docker cp ./backup.db expense-tracker-backend:/app/prisma/production.db

# Restart backend
docker-compose restart backend
```

### View Database

```bash
# Access SQLite CLI
docker-compose exec backend sh
cd /app/prisma
sqlite3 production.db

# Inside SQLite:
.tables
SELECT * FROM User;
.quit
```

---

## 🔄 Updates and Deployments

### Update Application Code

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up -d --build

# Check logs
docker-compose logs -f
```

### Run Database Migrations

```bash
# Migrations run automatically on container start
# Manual run if needed:
docker-compose exec backend npx prisma migrate deploy
```

---

## 🌐 Production Deployment

### Deploy to Server

1. **Copy files to server:**
   ```bash
   scp -r ./* user@server:/path/to/expense-tracker/
   ```

2. **On server, configure environment:**
   ```bash
   cd /path/to/expense-tracker
   nano .env
   ```

   **Production settings:**
   ```bash
   NODE_ENV=production
   JWT_SECRET=<strong-random-secret>
   FRONTEND_URL=https://yourdomain.com
   BACKEND_PORT=3001
   FRONTEND_PORT=80
   VITE_API_URL=https://api.yourdomain.com
   ```

3. **Start services:**
   ```bash
   docker-compose up -d
   ```

### Use Nginx as Reverse Proxy

**Install Nginx on host:**
```bash
sudo apt install nginx
```

**Configure Nginx** (`/etc/nginx/sites-available/expense-tracker`):
```nginx
# Frontend
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Increase upload size for receipts
    client_max_body_size 20M;
}
```

**Enable and restart:**
```bash
sudo ln -s /etc/nginx/sites-available/expense-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Add SSL with Certbot

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificates
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Auto-renewal is configured automatically
```

---

## 🐛 Troubleshooting

### Backend won't start

**Check logs:**
```bash
docker-compose logs backend
```

**Common issues:**

1. **Port already in use:**
   ```bash
   # Change BACKEND_PORT in .env
   BACKEND_PORT=3002
   ```

2. **JWT_SECRET not set:**
   ```bash
   # Make sure .env has JWT_SECRET
   JWT_SECRET=your-secret-here
   ```

3. **Database migration failed:**
   ```bash
   # Run migrations manually
   docker-compose exec backend npx prisma migrate deploy
   ```

### Frontend build fails

**Check build logs:**
```bash
docker-compose logs frontend
```

**Common issues:**

1. **VITE_API_URL not set:**
   ```bash
   # Make sure .env has VITE_API_URL
   VITE_API_URL=http://localhost:3001
   ```

2. **Build out of memory:**
   ```bash
   # Increase Docker memory in Docker Desktop settings
   # Recommended: 4GB+
   ```

### CORS errors

**Frontend can't reach backend:**

1. **Check FRONTEND_URL in backend:**
   ```bash
   # In .env
   FRONTEND_URL=http://localhost  # or your domain
   ```

2. **Restart backend:**
   ```bash
   docker-compose restart backend
   ```

### Database is empty after update

**SQLite database lost:**

1. **Check if volume exists:**
   ```bash
   docker volume ls | grep backend-data
   ```

2. **Restore from backup:**
   ```bash
   docker cp ./backup.db expense-tracker-backend:/app/prisma/production.db
   docker-compose restart backend
   ```

---

## 📈 Monitoring

### Health Checks

Docker Compose automatically monitors:
- **Backend**: `GET /health` every 30s
- **Frontend**: HTTP check every 30s

**View health status:**
```bash
docker-compose ps
```

Healthy containers show `Up (healthy)`.

### Resource Usage

```bash
# View resource stats
docker stats

# Specific container
docker stats expense-tracker-backend
```

---

## 🔐 Security Checklist

- [ ] Strong JWT_SECRET (64+ characters)
- [ ] NODE_ENV=production
- [ ] HTTPS enabled (use Nginx reverse proxy + Certbot)
- [ ] Regular database backups
- [ ] Keep Docker images updated
- [ ] Firewall configured (only ports 80, 443 open)
- [ ] Strong admin password created
- [ ] CORS properly configured

---

## 🆚 Docker vs Coolify

| Feature | Docker Compose ✅ | Coolify + Nixpacks |
|---------|------------------|---------------------|
| Setup Complexity | Medium | Low |
| Server Management | You manage | Coolify manages |
| Auto-deploy | Manual | Automatic (GitHub) |
| SSL Certificates | Manual (Certbot) | Automatic |
| Best For | Self-hosted servers | Coolify users |

**Use Docker if:**
- You want full control
- You have your own server
- You prefer manual deployments

**Use Coolify if:**
- You want auto-deploy from GitHub
- You prefer managed hosting
- You want automatic SSL

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

## ✅ Quick Reference

**Start:**
```bash
docker-compose up -d
```

**Stop:**
```bash
docker-compose down
```

**Logs:**
```bash
docker-compose logs -f
```

**Rebuild:**
```bash
docker-compose up -d --build
```

**Backup:**
```bash
docker cp expense-tracker-backend:/app/prisma/production.db ./backup.db
```

**Update:**
```bash
git pull && docker-compose up -d --build
```

---

**Your ExpenseTracker is now running with Docker! 🐳**

For Coolify deployment (simpler), see `COOLIFY_QUICKSTART.md`
