# Expense Tracker

A modern, full-stack expense tracking application with property management, built with React, Node.js, and PostgreSQL.

## Features

- 🏢 **Property Management** - Track expenses across multiple properties
- 💰 **Expense Tracking** - Categorize and manage expenses with receipt uploads
- 👥 **Reimbursement Tracking** - Manage debtors and payment records
- 📊 **Reports & Analytics** - Generate expense reports and summaries
- 🔐 **Secure Authentication** - JWT-based auth with bcrypt password hashing
- 🌙 **Dark Mode** - Modern 2025 UI with dark mode support
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 📎 **File Uploads** - Upload receipts (images/PDFs up to 20MB)

## Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS + shadcn/ui components
- React Router for navigation
- Axios for API calls
- Context API for state management

### Backend
- Node.js 18 with Express
- Prisma ORM for database management
- PostgreSQL 15 database
- JWT authentication
- Multer for file uploads
- Helmet.js for security headers
- Rate limiting and input sanitization

### Deployment
- Docker & Docker Compose
- GitHub Actions for CI/CD
- GitHub Container Registry (GHCR)
- Coolify-ready configuration
- Multi-platform support (amd64, arm64)

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/sfdxb7/expense.git
   cd expense
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and set secure values for JWT_SECRET and POSTGRES_PASSWORD
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3333
   - Backend API: http://localhost:3001
   - Database: localhost:5433

5. **Create your first user**
   ```bash
   docker-compose exec backend node scripts/createUser.js
   ```
   Follow the prompts to create an admin user.

## Deployment

### Option 1: Coolify with GitHub Actions (Recommended)

For production deployment with automated CI/CD:

1. **Read the deployment guide**
   - See [COOLIFY_DEPLOYMENT.md](COOLIFY_DEPLOYMENT.md) for detailed instructions
   - See [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md) for CI/CD setup

2. **Quick summary:**
   - Push code triggers GitHub Actions
   - Actions build and test Docker images
   - Images pushed to GitHub Container Registry
   - Coolify pulls pre-built images for fast deployment

### Option 2: Manual Docker Deployment

Deploy anywhere that supports Docker Compose:

```bash
# Set environment variables
export JWT_SECRET=$(openssl rand -hex 64)
export POSTGRES_PASSWORD=$(openssl rand -hex 32)
export FRONTEND_URL=https://your-domain.com

# Deploy
docker-compose up -d
```

## Project Structure

```
expense-tracker/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, validation, security
│   │   └── lib/            # Prisma client, utilities
│   ├── prisma/             # Database schema
│   └── scripts/            # User management scripts
├── frontend/                # React + Vite app
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context providers
│   │   └── lib/            # API client, utilities
│   └── nginx.conf          # Nginx configuration
├── .github/
│   └── workflows/          # GitHub Actions CI/CD
├── docker-compose.yml      # Local development
├── docker-compose.coolify.yml # Coolify deployment
└── docs/                   # Documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- (Registration disabled - create users manually)

### Properties
- `GET /api/properties` - List all properties
- `POST /api/properties` - Create property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Expenses
- `GET /api/expenses/property/:propertyId` - List expenses
- `POST /api/expenses/property/:propertyId` - Create expense
- `PUT /api/expenses/property/:propertyId/:id` - Update expense
- `DELETE /api/expenses/property/:propertyId/:id` - Delete expense

### Categories
- `GET /api/categories/property/:propertyId` - List categories
- `POST /api/categories/property/:propertyId` - Create category

### Reimbursements (Debtors)
- `GET /api/debtors/property/:propertyId` - List debtors
- `POST /api/debtors/property/:propertyId` - Create debtor
- `PUT /api/debtors/property/:propertyId/:id` - Update debtor

### Reports
- `GET /api/reports/property/:propertyId` - Generate expense report

## Configuration

### Environment Variables

Required variables (see `.env.example`):

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=expensetracker

# Security
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production

# CORS
FRONTEND_URL=https://your-domain.com
```

### File Upload Limits

Default: 20MB for receipts (images and PDFs)

To change:
- Backend: `backend/src/middleware/upload.js`
- Nginx: `frontend/nginx.conf` (client_max_body_size)
- Express: `backend/src/server.js` (body parser limits)

## User Management

Public registration is disabled for security. Create users manually:

### Method 1: Interactive Script (Recommended)
```bash
docker-compose exec backend node scripts/createUser.js
```

### Method 2: Direct SQL
```bash
docker-compose exec db psql -U postgres -d expensetracker
```
```sql
INSERT INTO "User" (username, email, password)
VALUES ('admin', 'admin@example.com', '$2a$10$...');
```

See [USER_MANAGEMENT.md](USER_MANAGEMENT.md) for detailed instructions.

## Development

### Running locally without Docker

**Backend:**
```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Database Migrations

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Building for Production

```bash
# Build images
docker-compose build

# Or use GitHub Actions (automatic on push to main)
```

## Security Features

- ✅ JWT authentication with secure token handling
- ✅ bcrypt password hashing (10 rounds)
- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ Rate limiting on auth endpoints
- ✅ Input sanitization (XSS protection)
- ✅ SQL injection prevention (Prisma ORM)
- ✅ File upload validation (MIME type checking)
- ✅ Environment variable secrets

## Monitoring & Health Checks

All services include health checks:

- **Backend**: `GET /health` (30s interval)
- **Frontend**: HTTP check (30s interval)
- **Database**: `pg_isready` (10s interval)

View status:
```bash
docker-compose ps
```

## Troubleshooting

### Database connection issues
```bash
# Check if database is healthy
docker-compose exec db pg_isready -U postgres

# View database logs
docker-compose logs db
```

### Backend not starting
```bash
# Check backend logs
docker-compose logs backend

# Verify environment variables
docker-compose exec backend env | grep DATABASE_URL
```

### File upload 413 errors
- Default limit: 20MB
- Increase in: `nginx.conf`, `upload.js`, `server.js`
- Rebuild frontend: `docker-compose up -d --build frontend`

### CORS errors
- Verify `FRONTEND_URL` in backend environment
- Should match your actual frontend URL

## CI/CD Pipeline

GitHub Actions automatically:
1. ✅ Builds Docker images on every push
2. ✅ Runs tests and health checks
3. ✅ Pushes to GitHub Container Registry
4. ✅ Multi-platform builds (amd64, arm64)
5. ✅ Signals Coolify for deployment

View workflows: https://github.com/sfdxb7/expense/actions

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

- 📖 Documentation: See `docs/` folder
- 🐛 Issues: https://github.com/sfdxb7/expense/issues
- 💬 Discussions: https://github.com/sfdxb7/expense/discussions

## Changelog

### Latest Release

**Features:**
- Compact expense layout with date grouping
- Receipt upload support (20MB images/PDFs)
- Manual user management (registration disabled)
- Dark mode support
- Automated CI/CD with GitHub Actions
- Coolify-ready deployment

**Security:**
- Multiple security enhancements
- Rate limiting
- Input sanitization
- XSS protection

**UI/UX:**
- Modern 2025 design
- Responsive layout
- Hover interactions
- Column-aligned expense lists

---

**Built with ❤️ using React, Node.js, and PostgreSQL**
