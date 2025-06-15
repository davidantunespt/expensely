#!/usr/bin/env tsx

/**
 * Database Test Script
 *
 * This script demonstrates how to:
 * 1. Connect to the database using Prisma
 * 2. Use ProfileService and ReceiptService
 * 3. Run database operations from the command line
 *
 * Usage: npm run script:test-db
 */

// Load environment variables from .env.local
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local file
config({ path: resolve(process.cwd(), ".env.local") });

import { ProfileService } from "../services/ProfileService";
import { ReceiptService } from "../services/ReceiptService";
import { prisma } from "../prisma";

async function main() {
  console.log("🚀 Starting database test script...\n");

  // Debug: Check if environment variables are loaded
  console.log("🔧 Environment check:");
  console.log(
    `   - DATABASE_URL: ${
      process.env.DATABASE_URL ? "✅ Loaded" : "❌ Missing"
    }`
  );
  console.log(
    `   - DIRECT_URL: ${process.env.DIRECT_URL ? "✅ Loaded" : "❌ Missing"}`
  );
  console.log();

  try {
    // Test 1: Check database connection
    console.log("📊 Testing database connection...");
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("✅ Database connection successful:", result);
    console.log();

    // Test 2: Count existing receipts (public schema - should work)
    console.log("🧾 Checking existing receipts...");
    try {
      const receiptsCount = await ReceiptService.getReceiptCount();
      console.log(`✅ Found ${receiptsCount} receipts in database`);
    } catch {
      console.log("⚠️  Could not access receipts table");
    }
    console.log();

    // Test 3: Check profiles (auth schema - might have permission issues)
    console.log("👥 Checking existing profiles...");
    try {
      const profileCount = await ProfileService.getProfileCount();
      console.log(`✅ Found ${profileCount} profiles in database`);
    } catch {
      console.log(
        "⚠️  Could not access profiles table (permission issue with auth schema)"
      );
      console.log(
        "     This is normal for Supabase - the prisma user may not have auth schema access"
      );
    }

    // Get expense summary for current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    console.log(
      `📅 Checking expenses for ${startOfMonth.toLocaleDateString()} - ${endOfMonth.toLocaleDateString()}`
    );

    // Note: This would need a user_id in a real scenario
    // For demo purposes, we'll just show the count
    console.log();

    // Test 4: Show database schema info
    console.log("🏗️  Database schema info...");
    const tables = (await prisma.$queryRaw`
      SELECT table_name, table_schema 
      FROM information_schema.tables 
      WHERE table_schema IN ('public', 'auth') 
      AND table_type = 'BASE TABLE'
      ORDER BY table_schema, table_name
    `) as Array<{ table_name: string; table_schema: string }>;

    console.log("✅ Available tables:");
    tables.forEach((table) => {
      console.log(`   - ${table.table_schema}.${table.table_name}`);
    });
    console.log();

    console.log("🎉 Database test completed successfully!");
  } catch (error) {
    console.error("❌ Database test failed:", error);
    process.exit(1);
  } finally {
    // Clean up database connection
    await prisma.$disconnect();
    console.log("🔌 Database connection closed");
  }
}

// Run the script
if (require.main === module) {
  main()
    .then(() => {
      console.log("✨ Script finished successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Script failed:", error);
      process.exit(1);
    });
}
