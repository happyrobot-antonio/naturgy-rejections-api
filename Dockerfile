# Dockerfile for Naturgy Backend API
FROM node:20-alpine

# Install OpenSSL and other necessary dependencies for Prisma
RUN apk add --no-cache openssl1.1-compat libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code and Prisma schema
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose port
EXPOSE 4000

# Start development server
CMD ["npm", "run", "dev"]
