// // This is your Prisma schema file,
// // learn more about it in the docs: https://pris.ly/d/prisma-schema

// // Get a free hosted Postgres database in seconds: `npx create-db`

// generator client {
//   provider = "prisma-client"
//   output   = "../src/generated/prisma"
// }

// datasource db {
//   provider = "postgresql"
// }




// model User {
//   id            String    @id @default(cuid())
//   email         String    @unique
//   username      String    @unique
//   passwordHash  String
//   isEmailVerified Boolean @default(false)
//   emailVerificationToken String? @unique
//   emailVerificationExpires DateTime?
//   passwordResetToken String? @unique
//   passwordResetExpires DateTime?
//   createdAt     DateTime  @default(now())
//   updatedAt     DateTime  @updatedAt
  
//   plants        Plant[]
//   transactions  Transaction[]
//   refreshTokens RefreshToken[]
// }

// model RefreshToken {
//   id            String    @id @default(cuid())
//   token         String    @unique
//   expiresAt     DateTime
//   isRevoked     Boolean   @default(false)
//   userAgent     String?
//   ipAddress     String?
//   createdAt     DateTime  @default(now())
  
//   userId        String
//   user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
// }

// model Plant {
//   id            String    @id @default(cuid())
//   name          String    @default("Sprout")
//   health        Int       @default(100)  // 0-100
//   waterLevel    Int       @default(100)  // 0-100
//   lastWateredAt DateTime  @default(now())
//   isAlive       Boolean   @default(true)
//   potType       String    @default("basic") // "basic", "ceramic", "golden"
//   createdAt     DateTime  @default(now())
  
//   userId        String
//   user          User      @relation(fields: [userId], references: [id])
// }

// model Transaction {
//   id            String    @id @default(cuid())
//   amount        Int       // Coins earned/spent
//   type          String    // "daily_checkin", "purchase_pot", "water_bonus"
//   createdAt     DateTime  @default(now())
  
//   userId        String
//   user          User      @relation(fields: [userId], references: [id])
// }

// // For the "Shop" - just hardcode this in your code, no need for a DB table
// // Pots: basic ($0), ceramic ($50), golden ($200)