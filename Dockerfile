# FROM node:22

# WORKDIR /app

# COPY package*.json ./

# RUN npm install


# COPY . .


# RUN npx prisma generate


# EXPOSE 4000

# CMD ["node", "src/server.js"]






# # ==========================================
# # STAGE 1: Full Dependencies & Prisma Client Generation
# # ==========================================
# FROM node:22-alpine AS prisma-builder
# WORKDIR /app

# # Install openssl for Prisma engines in alpine
# RUN apk add --no-cache openssl

# COPY package*.json ./
# COPY prisma ./prisma/

# # Install ALL dependencies (including Prisma CLI)
# RUN npm ci

# # Generate the custom Prisma Client engines
# RUN npx prisma generate


# # ==========================================
# # STAGE 2: Clean Production Dependencies
# # ==========================================
# FROM node:22-alpine AS production-deps
# WORKDIR /app

# COPY package*.json ./

# # Install ONLY production dependencies & aggressively purge the npm cache
# RUN npm ci --omit=dev && npm cache clean --force


# # ==========================================
# # STAGE 3: Ultra-lightweight Production Runtime
# # ==========================================
# FROM node:22-alpine AS runner
# WORKDIR /app

# # Ensure runtime has openssl for Prisma client to connect to the DB
# RUN apk add --no-cache openssl

# ENV NODE_ENV=production

# # Copy package references
# COPY package*.json ./

# # 1. Copy the lean production node_modules from Stage 2
# COPY --from=production-deps /app/node_modules ./node_modules

# # 2. Inject the custom generated Prisma Client artifacts from Stage 1
# # COPY --from=prisma-builder /app/node_modules/.prisma ./node_modules/.prisma
# # COPY --from=prisma-builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# # 3. Copy application files
# COPY --from=prisma-builder /app/src ./src
# COPY --from=prisma-builder /app/prisma ./prisma

# EXPOSE 4000

# CMD ["node", "src/server.js"]

















# ==========================================
# STAGE 1: Install dependencies + generate Prisma
# ==========================================
FROM node:26-alpine AS deps

WORKDIR /app

RUN apk update && apk upgrade

# Prisma requires OpenSSL
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies needed for Prisma generation
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate


# ==========================================
# STAGE 2: Production dependencies
# ==========================================
FROM node:26-alpine AS prod-deps

WORKDIR /app

RUN apk update && apk upgrade

COPY package*.json ./

RUN npm ci --omit=dev \
    && npm cache clean --force


# ==========================================
# STAGE 3: Production runtime
# ==========================================
FROM node:26-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Prisma runtime dependency
RUN apk update && apk upgrade \ 
    && apk add --no-cache openssl \
    && addgroup -S nodejs \
    && adduser -S nodejs -G nodejs \
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
    
# Production node_modules
COPY --from=prod-deps /app/node_modules ./node_modules

# Prisma generated client
# COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma
# COPY --from=deps /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Application source
COPY --chown=nodejs:nodejs src ./src
COPY --from=deps --chown=nodejs:nodejs /app/src/generated ./src/generated

# Only copy Prisma migrations/schema if runtime needs them
COPY --chown=nodejs:nodejs prisma ./prisma
COPY --chown=nodejs:nodejs prisma.config.ts ./

# Package metadata
COPY --chown=nodejs:nodejs package*.json ./

# HEALTHCHECK --interval= --timeout=5s --start-period= --retries=3 CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

USER nodejs

EXPOSE 4000

CMD ["node", "src/server.js"]





































# # ==========================================
# # STAGE 1: Dependencies & Build (Builder)
# # ==========================================
# FROM node:22-alpine AS builder

# WORKDIR /app

# # Copy dependency definitions
# COPY package*.json ./
# COPY prisma ./prisma/

# # Install ALL dependencies
# RUN npm ci

# # Copy full application source code
# COPY . .

# # Generate Prisma Client
# RUN npx prisma generate


# # ==========================================
# # STAGE 2: Lightweight Production Runtime
# # ==========================================
# FROM node:22-alpine AS runner

# WORKDIR /app

# ENV NODE_ENV=production

# # Copy package files for reference
# COPY package*.json ./

# # Copy complete node_modules from builder (includes Prisma generated client)
# COPY --from=builder /app/node_modules ./node_modules

# # Copy source code and Prisma schema
# COPY --from=builder /app/src ./src
# COPY --from=builder /app/prisma ./prisma

# EXPOSE 4000

# CMD ["node", "src/server.js"]3


