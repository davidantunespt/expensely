# Prisma Integration Guide

This project now includes Prisma as an ORM alongside Supabase for enhanced database operations and type safety.

## 🚀 Setup Complete

✅ **Prisma installed** - Latest version with PostgreSQL support  
✅ **Schema configured** - Matches your Supabase database structure  
✅ **Client generated** - TypeScript types available  
✅ **Service layer** - Clean API for database operations  
✅ **API routes** - Example endpoints using Prisma + Supabase auth

## 📁 Project Structure

```
src/
├── generated/prisma/     # Generated Prisma client (auto-generated)
├── lib/
│   ├── prisma.ts        # Prisma client configuration
│   └── services/
│       ├── ReceiptService.ts    # Receipt operations
│       └── ProfileService.ts    # User profile operations
├── app/api/receipts/    # Example API routes
└── ...
prisma/
└── schema.prisma        # Database schema definition
```

## 🔧 Environment Setup

1. **Update your `.env.local`** with your Supabase database URL:

   ```env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
   ```

   Replace:

   - `[PASSWORD]` - Your Supabase database password
   - `[PROJECT_REF]` - Your Supabase project reference (e.g., `qmaxcmmzpgdqmnidpsct`)

2. **Sync with your database**:
   ```bash
   npm run db:push  # Push schema to Supabase
   ```

## 🛠️ Available Scripts

```bash
npm run db:generate  # Regenerate Prisma client
npm run db:push      # Push schema changes to database
npm run db:pull      # Pull schema from database
npm run db:studio    # Open Prisma Studio (database GUI)
npm run db:reset     # Reset database (careful!)
```

## 💡 Usage Examples

### Using Prisma Services

```typescript
import { ReceiptService } from "@/lib/services/ReceiptService";
import { ProfileService } from "@/lib/services/ProfileService";

// Create a receipt
const receipt = await ReceiptService.createReceipt(userId, {
  vendor: "Starbucks",
  amount: 12.5,
  date: new Date(),
  category: "Meals",
  description: "Coffee for client meeting",
});

// Get user's receipts
const receipts = await ReceiptService.getUserReceipts(userId);

// Get expense summary
const summary = await ReceiptService.getUserExpenseSummary(userId);
```

### API Endpoints

```typescript
// GET /api/receipts - Get all user receipts
const response = await fetch("/api/receipts");
const { data: receipts } = await response.json();

// POST /api/receipts - Create new receipt
const response = await fetch("/api/receipts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    vendor: "Office Depot",
    amount: 45.99,
    date: "2024-01-15",
    category: "Office Supplies",
  }),
});
```

## 🔒 Security Features

- **Authentication via Supabase** - All API routes check user auth
- **Row Level Security** - Users can only access their own data
- **Type Safety** - Full TypeScript support with generated types
- **Validation** - Input validation in service layer

## 🎯 Key Benefits

1. **Type Safety** - Auto-generated TypeScript types
2. **Better DX** - Excellent IDE support and autocomplete
3. **Performance** - Optimized queries and connection pooling
4. **Maintainability** - Clean service layer architecture
5. **Flexibility** - Easy to extend with new models and operations

## 🔄 Hybrid Approach

This setup uses the best of both worlds:

- **Supabase** for authentication, real-time features, and edge functions
- **Prisma** for type-safe database operations and complex queries

## 📊 Database Schema

Current models:

- **Profile** - User profile information (extends Supabase auth)
- **Receipt** - Expense/receipt tracking with categories and metadata

## 🚨 Important Notes

1. **Keep schemas in sync** - When you modify `prisma/schema.prisma`, run `npm run db:push`
2. **Regenerate client** - After schema changes, run `npm run db:generate`
3. **Environment variables** - Make sure `DATABASE_URL` is correctly set
4. **Backup your data** - Before making major schema changes

## 🔗 Next Steps

1. Configure your Supabase DATABASE_URL in `.env.local`
2. Run `npm run db:push` to create tables
3. Test the API endpoints
4. Explore Prisma Studio: `npm run db:studio`
5. Start building with type-safe database operations!

For more information, check the [Prisma documentation](https://www.prisma.io/docs).
