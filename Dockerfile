# FROM node:22

# WORKDIR /app

# COPY package*.json ./

# RUN npm install


# COPY . .


# RUN npx prisma generate


# EXPOSE 4000

# CMD ["node", "src/server.js"]






# ==========================================
# STAGE 1: Dependencies & Build (Builder)
# ==========================================
# FROM node:22-alpine AS builder

# WORKDIR /app

# # Copy dependency definitions
# COPY package*.json ./
# COPY prisma ./prisma/

# # Install ALL dependencies (including dev dependencies needed for generation/compilation)
# RUN npm ci

# # Copy full application source code
# COPY . .

# # Generate Prisma Client binary into node_modules
# RUN npx prisma generate


# # ==========================================
# # STAGE 2: Lightweight Production Runtime
# # ==========================================
# FROM node:22-alpine AS runner

# WORKDIR /app

# # Set Node environment to production
# ENV NODE_ENV=production

# # Copy package files and install ONLY production dependencies to keep node_modules minimal
# COPY package*.json ./
# RUN npm ci --only=production

# # Copy generated Prisma Client and build artifacts from the builder stage
# COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
# COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
# COPY --from=builder /app/src ./src
# COPY --from=builder /app/prisma ./prisma

# EXPOSE 4000

# CMD ["node", "src/server.js"]








# ==========================================
# STAGE 1: Dependencies & Build (Builder)
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies
RUN npm ci

# Copy full application source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate


# ==========================================
# STAGE 2: Lightweight Production Runtime
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy package files for reference
COPY package*.json ./

# Copy complete node_modules from builder (includes Prisma generated client)
COPY --from=builder /app/node_modules ./node_modules

# Copy source code and Prisma schema
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000

CMD ["node", "src/server.js"]