FROM node:18-alpine

WORKDIR /app

# Install OpenSSL for Prisma and wget for health checks
RUN apk add --no-cache openssl wget

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Generate Prisma Client
RUN npx prisma generate

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3000

CMD ["npm", "start"]
