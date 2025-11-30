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
- 🧪 **Comprehensive Testing** - Full test coverage for backend and frontend

## Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS + shadcn/ui components
- React Router for navigation
- Axios for API calls
- Context API for state management
- Vitest + React Testing Library for testing

### Backend
- Node.js 18 with Express
- Prisma ORM for database management
- SQLite database (self-contained, file-based)
- JWT authentication
- Multer for file uploads
- Helmet.js for security headers
- Rate limiting and input sanitization
- Jest + Supertest for testing

## Deployment

Choose your deployment method:

### 🚀 Option 1: Coolify (Easiest - Recommended)

Deploy using **Nixpacks** - automatic builds from GitHub, no Docker knowledge required!

📖 **Quick Start**: [COOLIFY_QUICKSTART.md](COOLIFY_QUICKSTART.md) - **5 minute setup**

**What You Get:**
- ✅ Auto-deploy from GitHub on every push
- ✅ Embedded SQLite database (self-contained)
- ✅ Automatic SSL certificates
- ✅ Zero Docker knowledge needed

### 🐳 Option 2: Docker Compose (Full Control)

Deploy using **Docker Compose** - complete control over your deployment.

📖 **Quick Start**: [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) - **3 minute setup**

**What You Get:**
- ✅ One command deployment (`docker-compose up -d`)
- ✅ Embedded SQLite database with persistent volumes
- ✅ Production-ready Nginx configuration
- ✅ Full control over infrastructure

**Quick start:**
```bash
# Copy environment file
cp .env.docker.example .env

# Edit .env and set JWT_SECRET
nano .env

# Start everything
docker-compose up -d

# Create first user
docker-compose exec backend node scripts/createUser.js
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- Git

**Note:** No database installation needed! SQLite is embedded.

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/sfdxb7/expense.git
   cd expense
   ```

2. **Set up environment variables**

   **Backend** (`backend/.env`):
   ```bash
   DATABASE_URL=file:./prisma/dev.db
   JWT_SECRET=your-super-secret-jwt-key-change-this
   NODE_ENV=development
   PORT=3000
   FRONTEND_URL=http://localhost:5173
   ```

3. **Install and run backend**
   ```bash
   cd backend
   npm install
   npx prisma migrate dev
   npm run dev
   ```

4. **Install and run frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

6. **Create your first user**
   ```bash
   cd backend
   node scripts/createUser.js
   ```
   Follow the prompts to create an admin user.

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
│   ├── tests/              # Backend tests (Jest)
│   └── scripts/            # User management scripts
├── frontend/                # React + Vite app
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context providers
│   │   └── lib/            # API client, utilities
│   └── tests/              # Frontend tests (Vitest)
└── TESTING.md              # Testing documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- (Registration disabled - create users manually)

### Properties
- `GET /api/properties` - List all properties
- `GET /api/properties/:id` - Get property details
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
- `PUT /api/categories/property/:propertyId/:id` - Update category
- `DELETE /api/categories/property/:propertyId/:id` - Delete category

### Reimbursements (Debtors)
- `GET /api/debtors/property/:propertyId` - List debtors
- `POST /api/debtors/property/:propertyId` - Create debtor
- `PUT /api/debtors/property/:propertyId/:id` - Update debtor
- `DELETE /api/debtors/property/:propertyId/:id` - Delete debtor

### Payments
- `GET /api/payments/debtor/:debtorId` - List payments
- `POST /api/payments/debtor/:debtorId` - Create payment
- `PUT /api/payments/debtor/:debtorId/:id` - Update payment
- `DELETE /api/payments/debtor/:debtorId/:id` - Delete payment

### Reports
- `GET /api/reports/property/:propertyId` - Generate expense report
- `GET /api/reports/property/:propertyId/year/:year` - Yearly report

## Testing

See [TESTING.md](TESTING.md) for comprehensive testing documentation.

### Run Tests

**Backend:**
```bash
cd backend
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage report
```

**Frontend:**
```bash
cd frontend
npm test                 # Run all tests
npm run test:ui          # Interactive UI
npm run test:coverage    # With coverage report
```

### Test Coverage

- **50+ tests** across backend and frontend
- Backend: Jest + Supertest (API integration tests)
- Frontend: Vitest + React Testing Library (component tests)
- Coverage reports generated in `coverage/` directories

## User Management

Public registration is disabled for security. Create users manually:

### Interactive Script (Recommended)
```bash
cd backend
node scripts/createUser.js
```

### Direct Database Access
```bash
psql -U postgres -d expensetracker
```
```sql
INSERT INTO "User" (username, email, password)
VALUES ('admin', 'admin@example.com', '$2a$10$...');
```

See [USER_MANAGEMENT.md](USER_MANAGEMENT.md) for detailed instructions.

## Database Migrations

```bash
cd backend

# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

## Security Features

- ✅ JWT authentication with secure token handling
- ✅ bcrypt password hashing (10 rounds)
- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ Rate limiting on auth endpoints (5 req/15min)
- ✅ Input sanitization (XSS protection)
- ✅ SQL injection prevention (Prisma ORM)
- ✅ File upload validation (MIME type checking)
- ✅ Environment variable secrets

## Configuration

### Environment Variables

**Backend** (`.env`):
```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/expensetracker

# Security
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development

# Server
PORT=3000

# CORS
FRONTEND_URL=http://localhost:5173
```

**Testing** (`backend/.env.test`):
```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/expensetracker_test
JWT_SECRET=test-jwt-secret-key-for-testing-only
NODE_ENV=test
```

### File Upload Limits

Default: 20MB for receipts (images and PDFs)

To change:
- Backend: `backend/src/middleware/upload.js`
- Express: `backend/src/server.js` (body parser limits)

## Troubleshooting

### Database connection issues
```bash
# Check if PostgreSQL is running
psql --version
pg_isready

# Test connection
psql -U postgres -d expensetracker
```

### Backend not starting
```bash
# Check environment variables
cat backend/.env

# Verify database migrations
cd backend
npx prisma migrate status
```

### CORS errors
- Verify `FRONTEND_URL` in backend `.env`
- Should match your actual frontend URL (e.g., `http://localhost:5173`)

### Port already in use
```bash
# Kill process on port 3000 (backend)
npx kill-port 3000

# Kill process on port 5173 (frontend)
npx kill-port 5173
```

## Development Scripts

### Backend
```bash
npm run dev          # Start development server
npm test             # Run tests
npm run migrate      # Run database migrations
npm run studio       # Open Prisma Studio
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm test             # Run tests
```

## Production Deployment

### Building for Production

**Backend:**
```bash
cd backend
npm install --production
npx prisma migrate deploy
npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm run build
# Serve the dist/ folder with your web server
```

### Environment Setup

1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Create initial user
5. Start backend server
6. Serve frontend build

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Write tests for new functionality
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

**Testing Requirements:**
- All new features must include tests
- Maintain 80%+ code coverage
- All tests must pass before merging

## Changelog

### Latest Release

**Features:**
- Comprehensive test suite (Jest + Vitest)
- 50+ tests covering backend and frontend
- Compact expense layout with date grouping
- Receipt upload support (20MB images/PDFs)
- Manual user management (registration disabled)
- Dark mode support

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

**Testing:**
- Backend API integration tests
- Frontend component tests
- Test coverage reporting
- CI/CD ready

## License

MIT License - see LICENSE file for details

## Support

- 📖 Documentation: See `TESTING.md` and `USER_MANAGEMENT.md`
- 🐛 Issues: https://github.com/sfdxb7/expense/issues
- 💬 Discussions: https://github.com/sfdxb7/expense/discussions

---

**Built with ❤️ using React, Node.js, and PostgreSQL**
