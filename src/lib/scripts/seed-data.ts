#!/usr/bin/env tsx

/**
 * Database Seeding Script
 *
 * This script creates sample data for testing:
 * 1. Sample user profiles
 * 2. Sample receipt/expense data
 * 3. Various categories and payment methods
 *
 * Usage: npm run script:seed
 */

// Load environment variables from .env.local
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local file
config({ path: resolve(process.cwd(), ".env.local") });

import { ProfileService } from "../services/ProfileService";
import { ReceiptService } from "../services/ReceiptService";
import { prisma } from "../prisma";
import { Category, DocumentType } from "../../generated/prisma";

// Sample data templates
const sampleUsers = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    firstName: "John",
    lastName: "Doe",
    displayName: "John Doe",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    firstName: "Jane",
    lastName: "Smith",
    displayName: "Jane Smith",
  },
];

const sampleReceipts = [
  {
    documentType: "Invoice",
    documentId: "1234567890",
    documentDate: new Date().toISOString(),
    category: "Office Supplies",
    description: "Printer paper and pens",
    isDeductible: true,
    paymentMethod: "Credit Card",
    taxAmount: 89.99,
    confidence: 100,
    organizationId: "1234567890",
  },
  {
    documentType: "Invoice",
    documentId: "1234567890",
    documentDate: new Date().toISOString(),
    category: "Meals & Entertainment",
    description: "Client meeting coffee",
    isDeductible: true,
    paymentMethod: "Cash",
    taxAmount: 12.5,
    confidence: 100,
    organizationId: "1234567890",
  },
  {
    documentType: "Invoice",
    documentId: "1234567890",
    documentDate: new Date().toISOString(),
    category: "Transportation",
    description: "Trip to client office",
    isDeductible: true,
    paymentMethod: "Credit Card",
    taxAmount: 25.75,
    confidence: 100,
    organizationId: "1234567890",
  },
  {
    vendor: "AWS",
    amount: 156.43,
    category: "Software & Services",
    description: "Cloud hosting services",
    paymentMethod: "Auto-pay",
    isDeductible: true,
  },
  {
    vendor: "Adobe",
    amount: 52.99,
    category: "Software & Services",
    description: "Creative Cloud subscription",
    paymentMethod: "Credit Card",
    isDeductible: true,
  },
];

async function main() {
  console.log("🌱 Starting database seeding...\n");

  try {
    // Clear existing sample data (optional)
    console.log("🧹 Cleaning up existing sample data...");
    await prisma.receipt.deleteMany({
      where: {
        addedById: {
          in: sampleUsers.map((u) => u.id),
        },
      },
    });
    await prisma.profile.deleteMany({
      where: {
        id: {
          in: sampleUsers.map((u) => u.id),
        },
      },
    });
    console.log("✅ Cleanup completed");
    console.log();

    // Create sample profiles
    console.log("👥 Creating sample user profiles...");
    const createdProfiles = [];

    for (const user of sampleUsers) {
      try {
        const profile = await ProfileService.createProfile(user);
        createdProfiles.push(profile);
        console.log(
          `✅ Created profile for ${user.firstName} ${user.lastName}`
        );
      } catch {
        console.log(
          `⚠️  Profile for ${user.firstName} ${user.lastName} might already exist`
        );
      }
    }
    console.log();

    // Create sample receipts for the first user
    if (createdProfiles.length > 0) {
      const firstUser = createdProfiles[0];
      console.log(
        `🧾 Creating sample receipts for ${firstUser.displayName}...`
      );

      for (const receiptData of sampleReceipts) {
        // Generate random date within last 30 days
        const randomDaysAgo = Math.floor(Math.random() * 30);
        const receiptDate = new Date();
        receiptDate.setDate(receiptDate.getDate() - randomDaysAgo);

        await ReceiptService.createReceipt(firstUser.id, {
          documentType: DocumentType.INVOICE,
          documentId: receiptData.documentId ?? "",
          documentDate: receiptDate.toISOString(),
          category: receiptData.category as Category,
          description: receiptData.description,
          isDeductible: receiptData.isDeductible ?? true,
          paymentMethod: receiptData.paymentMethod,
          taxAmount: receiptData.taxAmount ?? 0,
          confidence: receiptData.confidence ?? 0,
          organizationId: receiptData.organizationId ?? "",
          totalAmount: receiptData.amount ?? 0,
        });

        console.log(
          `✅ Created receipt: ${receiptData.vendor} - $${receiptData.amount}`
        );
      }
      console.log();
    }

    // Show summary
    console.log("📊 Seeding summary:");
    const profileCount = await ProfileService.getProfileCount();
    const receiptCount = await ReceiptService.getReceiptCount();

    console.log(`   - Total profiles: ${profileCount}`);
    console.log(`   - Total receipts: ${receiptCount}`);
    console.log();

    // Show expense summary for first user
    if (createdProfiles.length > 0) {
      const firstUser = createdProfiles[0];
      console.log(`💰 Expense summary for ${firstUser.displayName}:`);
      const summary = await ReceiptService.getUserExpenseSummary(firstUser.id);
      console.log(`   - Total expenses: $${summary.totalExpenses.toFixed(2)}`);
      console.log(
        `   - Tax deductible: $${summary.taxDeductibleExpenses.toFixed(2)}`
      );
      console.log(`   - Receipt count: ${summary.receiptCount}`);
      console.log();
    }

    console.log("🎉 Database seeding completed successfully!");
    console.log(
      "💡 You can now use these sample users to test the application"
    );
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log("🔌 Database connection closed");
  }
}

// Run the script
if (require.main === module) {
  main()
    .then(() => {
      console.log("✨ Seeding script finished successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeding script failed:", error);
      process.exit(1);
    });
}
