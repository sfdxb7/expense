#!/usr/bin/env node

/**
 * Batch User Creation Script
 * Creates multiple users at once
 * Works in both local dev and Docker production
 */

const path = require('path');

// Use DATABASE_URL from environment if set, otherwise use local dev.db
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:' + path.join(__dirname, '..', 'prisma', 'dev.db');
}

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Users to create
const users = [
  { username: 'saeed', email: 'saeed@expense.local', password: 'bu3askoor' },
  { username: 'massam', email: 'massam@expense.local', password: 'fatma' },
];

async function createUsers() {
  console.log('\n=== Creating Users ===\n');

  for (const userData of users) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { username: userData.username },
            { email: userData.email }
          ]
        }
      });

      if (existingUser) {
        console.log(`⏭️  User "${userData.username}" already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          username: userData.username,
          email: userData.email,
          password: hashedPassword
        }
      });

      console.log(`✅ Created user: ${user.username} (${user.email})`);
    } catch (error) {
      console.error(`❌ Error creating user "${userData.username}":`, error.message);
    }
  }

  console.log('\n=== Done ===\n');
}

createUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
