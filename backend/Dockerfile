# Backend Dockerfile - Self-contained with SQLite
FROM node:18-alpine

# Install SQLite
RUN apk add --no-cache sqlite

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --production

# Generate Prisma Client
RUN npx prisma generate

# Copy application code
COPY . .

# Create directory for SQLite database (will be mounted as volume)
RUN mkdir -p /app/prisma

# Create directory for uploads
RUN mkdir -p /app/uploads

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

# Start command: run migrations then start server
CMD npx prisma migrate deploy && node src/server.js
