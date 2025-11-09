# Expense Tracker

A full-stack web application for tracking expenses across multiple properties with debtor management and reporting capabilities. Built with React, Node.js, Express, PostgreSQL, and designed for self-hosting via Docker.

## Features

### Core Functionality
- **Multi-Workspace Support** - Each user has their own isolated workspace
- **Property Management** - Track expenses for multiple properties (buildings, houses, farms, etc.)
- **Expense Tracking** - Record expenses with categories, dates, amounts, descriptions, and optional receipt uploads
- **Inline Category Management** - Create, edit, and delete categories directly from the expense form dropdown
- **Debtor & Payment Tracking** - Track who owes you money and record payments received
- **Running Balance** - Real-time calculation of balance (total expenses - total payments)
- **Comprehensive Reports** - Generate yearly or custom date range reports with export functionality

### Technical Features
- **Mobile-First Design** - Responsive UI optimized for phones, tablets, and desktop
- **Secure Authentication** - JWT-based authentication with bcrypt password hashing
- **File Upload Support** - Attach receipts (images/PDFs) to expenses
- **Modern UI** - Built with Tailwind CSS and shadcn/ui components
- **Self-Contained** - Everything runs in Docker containers (frontend, backend, database)
- **AED Currency** - Default currency set to UAE Dirham (easily customizable)

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Radix UI / shadcn/ui components
- React Router
- Axios

### Backend
- Node.js
- Express
- Prisma ORM
- PostgreSQL
- JWT authentication
- Multer (file uploads)

### Deployment
- Docker & Docker Compose
- Nginx (reverse proxy)
- PostgreSQL (database)

## Project Structure

```
expense-tracker/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── controllers/           # Request handlers
│   │   ├── middleware/            # Auth, file upload
│   │   ├── routes/                # API routes
│   │   └── server.js              # Express app
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── pages/                 # Page components
│   │   ├── lib/                   # Utilities, API client
│   │   └── context/               # Auth context
│   ├── Dockerfile
│   ├── nginx.conf                 # Nginx configuration
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

## Getting Started

### Prerequisites
- Docker
- Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ExpenseTracker
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` file and set your JWT secret**
   ```env
   JWT_SECRET=your-very-secure-random-secret-key-here
   DATABASE_URL=postgresql://postgres:postgres@db:5432/expensetracker
   NODE_ENV=production
   PORT=3000
   ```

   **Important:** Change the `JWT_SECRET` to a strong, random string!

4. **Build and start the application**
   ```bash
   docker-compose up -d --build
   ```

5. **Wait for services to start**
   The database needs to initialize and migrations need to run. This takes about 30-60 seconds.

6. **Access the application**
   Open your browser and go to `http://localhost` (or your server IP)

## Deployment on Coolify

Coolify makes deployment even easier:

1. **In Coolify Dashboard:**
   - Create a new project
   - Add a new resource → Docker Compose
   - Upload or paste your `docker-compose.yml`

2. **Set Environment Variables:**
   - Add `JWT_SECRET` with a secure random value
   - Optionally customize `DATABASE_URL` if needed

3. **Deploy:**
   - Click "Deploy"
   - Coolify will build and start all services

4. **Access:**
   - Coolify will provide you with a public URL
   - You can also configure a custom domain

## Usage

### First Time Setup

1. **Register an Account**
   - Go to the registration page
   - Create your username, email, and password
   - Each user gets their own isolated workspace

2. **Create a Property**
   - Click "Add Property" on the dashboard
   - Enter property name (e.g., "Shared Building", "Mother's House")
   - Add optional description

3. **Set Up Categories**
   - When adding your first expense, categories can be created inline
   - Select "+ Add New Category" from the dropdown
   - Common categories: Utilities, Maintenance, Repairs, Groceries, Staff, etc.

### Managing Expenses

1. **Add Expense**
   - Navigate to a property
   - Click "Add Expense"
   - Select date, amount, category, description
   - Optionally upload a receipt (image or PDF)
   - Click "Add Expense"

2. **Create Category On-the-Fly**
   - In the expense form, select "+ Add New Category"
   - Enter category name
   - Click "Add" - the category is created and automatically selected

3. **Edit/Delete Expenses**
   - Click the edit or delete icon on any expense
   - Receipts can be viewed by clicking the link

### Managing Debtors & Payments

1. **Add Debtor**
   - Go to "Debtors & Payments" tab
   - Click "Add Debtor"
   - Enter name (e.g., "Brother", "Mother")

2. **Record Payment**
   - Click "Add" button on a debtor card
   - Enter payment amount, date, and optional notes
   - Click "Record Payment"

3. **View Balance**
   - Total payments are shown for each debtor
   - The property summary shows overall balance

### Generating Reports

1. **Choose Report Type**
   - Go to "Reports" tab
   - Select "Yearly Report" or "Custom Date Range"

2. **Generate Report**
   - For yearly: select year
   - For custom: select start and end dates
   - Click "Generate Report"

3. **View & Export**
   - Review summary statistics
   - See expenses by category
   - See payments by debtor
   - View detailed expense list
   - Click "Export" to download as text file

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile

### Properties
- `GET /api/properties` - List all properties
- `POST /api/properties` - Create property
- `GET /api/properties/:id` - Get property details
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Categories
- `GET /api/categories/property/:propertyId` - List categories
- `POST /api/categories/property/:propertyId` - Create category
- `PUT /api/categories/property/:propertyId/:id` - Update category
- `DELETE /api/categories/property/:propertyId/:id` - Delete category

### Expenses
- `GET /api/expenses/property/:propertyId` - List expenses
- `POST /api/expenses/property/:propertyId` - Create expense (multipart/form-data)
- `PUT /api/expenses/property/:propertyId/:id` - Update expense
- `DELETE /api/expenses/property/:propertyId/:id` - Delete expense

### Debtors
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
- `GET /api/reports/property/:propertyId` - Generate custom report (query params: startDate, endDate)
- `GET /api/reports/property/:propertyId/year/:year` - Generate yearly report

## Database Schema

The application uses PostgreSQL with Prisma ORM. Key models:

- **User** - Authentication and workspace isolation
- **Property** - Properties/buildings/houses
- **Category** - Expense categories (per property)
- **Expense** - Individual expenses with optional receipts
- **Debtor** - People who owe money
- **Payment** - Payments received from debtors

## Customization

### Change Currency

Edit `frontend/src/lib/utils.js`:

```javascript
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD', // Change to your currency code
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
```

### Modify Theme Colors

Edit `frontend/tailwind.config.js` to customize colors.

### Change Upload Limits

Edit `backend/src/middleware/upload.js` to change file size limits or allowed types.

## Troubleshooting

### Application won't start
- Check Docker logs: `docker-compose logs -f`
- Ensure ports 80, 3000, and 5432 are not in use
- Verify `.env` file is properly configured

### Database connection errors
- Wait 30-60 seconds for database to initialize
- Check database logs: `docker-compose logs db`
- Ensure DATABASE_URL is correct in `.env`

### Can't upload receipts
- Check backend logs: `docker-compose logs backend`
- Ensure `uploads` directory has proper permissions
- Verify file size is under 5MB
- Confirm file type is JPEG, PNG, or PDF

### Login not working
- Clear browser cache and cookies
- Ensure JWT_SECRET is set in `.env`
- Check backend logs for errors

## Development

### Local Development Setup

1. **Backend**
   ```bash
   cd backend
   npm install
   cp ../.env.example .env
   # Edit .env with local DATABASE_URL
   npx prisma migrate dev
   npm run dev
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Database**
   ```bash
   docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15-alpine
   ```

### Running Migrations

```bash
cd backend
npx prisma migrate dev --name migration_name
```

### Database Studio

```bash
cd backend
npx prisma studio
```

## Security Considerations

- Change `JWT_SECRET` to a strong, random value
- Use HTTPS in production
- Keep Docker images updated
- Regularly backup your database
- Implement rate limiting if exposed to internet
- Consider adding 2FA for sensitive deployments

## Backup & Restore

### Backup Database
```bash
docker-compose exec db pg_dump -U postgres expensetracker > backup.sql
```

### Restore Database
```bash
docker-compose exec -T db psql -U postgres expensetracker < backup.sql
```

### Backup Uploaded Files
```bash
tar -czf uploads-backup.tar.gz backend/uploads/
```

## License

MIT License - feel free to use this for personal or commercial projects.

## Support

For issues or questions, please open an issue on GitHub or contact the maintainer.

## Roadmap

Potential future enhancements:
- Multi-currency support
- Recurring expenses
- Budget limits and alerts
- Mobile apps (React Native)
- Email notifications
- CSV/Excel export
- Advanced analytics and charts
- Expense splitting by percentage
- Multi-user access per property

---

Built with ❤️ for managing shared property expenses.
