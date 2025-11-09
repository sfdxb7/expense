# User Management Guide

Public registration has been disabled for security. You can add users manually using one of the following methods:

## Method 1: Using the User Creation Script (Recommended)

Run the interactive script from your backend container:

```bash
# Enter the backend container
docker-compose exec backend sh

# Run the user creation script
node scripts/createUser.js

# Follow the prompts to enter:
# - Username (min 3 characters)
# - Email
# - Password (min 8 characters, must include uppercase, lowercase, number, special char)
```

## Method 2: Using Prisma Studio (GUI)

Prisma Studio provides a visual interface to manage your database:

```bash
# Start Prisma Studio
cd backend
npm run studio

# Open browser to http://localhost:5555
# Navigate to User model
# Click "Add record"
# Fill in the fields (you'll need to hash the password manually)
```

**Note:** When using Prisma Studio, you must manually hash the password. You can use this command:

```bash
# In backend container
docker-compose exec backend node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('YourPassword123!', 10))"
```

## Method 3: Direct Database Access

If you prefer direct SQL commands:

```bash
# Connect to the database
docker-compose exec db psql -U postgres -d expense_tracker

# Insert a new user (replace values)
INSERT INTO "User" (id, username, email, password, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'newuser',
  'user@example.com',
  '$2a$10$...', -- Use hashed password from Method 2
  NOW(),
  NOW()
);
```

## Password Requirements

All passwords must meet these requirements:
- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number
- At least one special character (!@#$%^&*)

## Example Strong Passwords

- `ExpenseTrack2025!`
- `MySecure#Pass123`
- `Family$Budget24`

## Security Note

Keep these credentials safe! Store them in a password manager and only share with authorized users.
