



// import { PrismaClient } from "./generated/prisma/client.ts";
// import { PrismaPg } from "@prisma/adapter-pg";

// const adapter = new PrismaPg({
//   connectionString: process.env.DATABASE_URL,
// });

// export const prisma = new PrismaClient({
//   adapter,
// });


// import { PrismaClient } from "./generated/prisma/client.ts";


import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import path from "path";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

const caCertPath =
  process.env.NODE_ENV === "production"
    ? "/etc/secrets/ca.pem"
    : path.join(process.cwd(), "certs", "ca.pem");
    

let caCert = "";
try {
  caCert = fs.readFileSync(caCertPath, "utf8");
} catch (error) {
  console.warn("Warning: ca.pem not found. Proceeding without it.");
}


const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true,
    ca: caCert,
  },
});

export const prisma = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : ["error"],
});

// export const prisma = new PrismaClient();




// // ✅ Import from @prisma/client (not the generated path)
// import pkg from '@prisma/client'
// const { PrismaClient } = pkg
// import { PrismaPg } from '@prisma/adapter-pg'
// import { Pool } from 'pg'

// // ✅ Create a Pool with explicit configuration
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   // If URL encoding doesn't work, use individual params
//   // host: 'localhost',
//   // port: 5432,
//   // database: 'houseplant',
//   // user: 'postgres',
//   // password: 'hellopin1@',
// })

// // ✅ Create the adapter
// const adapter = new PrismaPg(pool)

// // ✅ Create Prisma Client with adapter
// export const prisma = new PrismaClient({
//   adapter,
//   log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
// })

// console.log('✅ Prisma Client initialized with PostgreSQL adapter')