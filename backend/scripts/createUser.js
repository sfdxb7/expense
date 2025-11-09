#!/usr/bin/env node

/**
 * Manual User Creation Script
 *
 * Usage: node scripts/createUser.js
 *
 * This script allows you to manually create users since public registration is disabled.
 * Run this from the backend directory.
 */

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createUser() {
  try {
    console.log('\n=== Create New User ===\n');

    const username = await question('Username (min 3 characters): ');
    if (username.trim().length < 3) {
      console.error('❌ Username must be at least 3 characters');
      process.exit(1);
    }

    const email = await question('Email: ');
    if (!email.includes('@')) {
      console.error('❌ Invalid email address');
      process.exit(1);
    }

    const password = await question('Password (min 8 characters, must include uppercase, lowercase, number, special char): ');

    // Validate password
    if (password.length < 8) {
      console.error('❌ Password must be at least 8 characters');
      process.exit(1);
    }
    if (!/[a-z]/.test(password)) {
      console.error('❌ Password must contain at least one lowercase letter');
      process.exit(1);
    }
    if (!/[A-Z]/.test(password)) {
      console.error('❌ Password must contain at least one uppercase letter');
      process.exit(1);
    }
    if (!/[0-9]/.test(password)) {
      console.error('❌ Password must contain at least one number');
      process.exit(1);
    }
    if (!/[!@#$%^&*]/.test(password)) {
      console.error('❌ Password must contain at least one special character (!@#$%^&*)');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username.trim() },
          { email: email.trim().toLowerCase() }
        ]
      }
    });

    if (existingUser) {
      console.error('❌ User with this username or email already exists');
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword
      }
    });

    console.log('\n✅ User created successfully!');
    console.log(`   ID: ${user.id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Error creating user:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

createUser();
