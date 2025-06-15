import { prisma } from "@/lib/prisma";
import { Category, DocumentType, Receipt } from "@/generated/prisma";

export type CreateReceiptData = {
  documentType: DocumentType;
  documentId: string;
  documentDate: string;
  category: Category;
  description: string;
  isDeductible: boolean;
  paymentMethod: string;
  taxAmount: number;
  totalAmount: number;
  confidence: number;
  organizationId: string;
};

export type UpdateReceiptData = Partial<CreateReceiptData>;

export class ReceiptService {
  /**
   * Create a new receipt for a user
   */
  static async createReceipt(
    userId: string,
    data: CreateReceiptData
  ): Promise<Receipt> {
    return await prisma.receipt.create({
      data: {
        addedById: userId,
        totalAmount: data.totalAmount,
        createdAt: new Date(),
        category: data.category,
        isDeductible: data.isDeductible ?? true,
        paymentMethod: data.paymentMethod,
        taxAmount: data.taxAmount,
        confidence: data.confidence,
      },
    });
  }

  /**
   * Get all receipts for a user
   */
  static async getUserReceipts(userId: string): Promise<Receipt[]> {
    return await prisma.receipt.findMany({
      where: {
        addedById: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Get a single receipt by ID (with user verification)
   */
  static async getReceiptById(
    receiptId: string,
    userId: string
  ): Promise<Receipt | null> {
    return await prisma.receipt.findFirst({
      where: {
        id: receiptId,
        addedById: userId,
      },
    });
  }

  /**
   * Update a receipt
   */
  static async updateReceipt(
    receiptId: string,
    userId: string,
    data: UpdateReceiptData
  ): Promise<Receipt | null> {
    // First verify the receipt belongs to the user
    const existingReceipt = await this.getReceiptById(receiptId, userId);
    if (!existingReceipt) {
      return null;
    }

    return await prisma.receipt.update({
      where: {
        id: receiptId,
      },
      data: {
        documentType: data.documentType,
        documentId: data.documentId,
        documentDate: data.documentDate,
        category: data.category,
        description: data.description,
        isDeductible: data.isDeductible,
        paymentMethod: data.paymentMethod,
        taxAmount: data.taxAmount,
        confidence: data.confidence,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Delete a receipt
   */
  static async deleteReceipt(
    receiptId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const result = await prisma.receipt.deleteMany({
        where: {
          id: receiptId,
          addedById: userId,
        },
      });
      return result.count > 0;
    } catch (error) {
      console.error("Error deleting receipt:", error);
      return false;
    }
  }

  /**
   * Get user's expense summary
   */
  static async getUserExpenseSummary(userId: string) {
    const receipts = await prisma.receipt.findMany({
      where: {
        addedById: userId,
      },
    });

    const totalExpenses = receipts.reduce(
      (sum, receipt) => sum + Number(receipt.totalAmount),
      0
    );
    const taxDeductibleExpenses = receipts
      .filter((receipt) => receipt.isDeductible)
      .reduce((sum, receipt) => sum + Number(receipt.totalAmount), 0);

    const currentMonth = new Date();
    const currentMonthExpenses = receipts
      .filter((receipt) => {
        const receiptDate = new Date(receipt.createdAt);
        return (
          receiptDate.getMonth() === currentMonth.getMonth() &&
          receiptDate.getFullYear() === currentMonth.getFullYear()
        );
      })
      .reduce((sum, receipt) => sum + Number(receipt.totalAmount), 0);

    return {
      totalExpenses,
      taxDeductibleExpenses,
      currentMonthExpenses,
      receiptCount: receipts.length,
    };
  }

  /**
   * Get total receipt count (for admin/stats purposes)
   */
  static async getReceiptCount(): Promise<number> {
    return await prisma.receipt.count();
  }

  /**
   * Get expenses by category
   */
  static async getExpensesByCategory(userId: string) {
    const categoryData = await prisma.receipt.groupBy({
      by: ["category"],
      where: {
        addedById: userId,
      },
      _sum: {
        totalAmount: true,
      },
      _count: {
        _all: true,
      },
    });

    return categoryData.map((item) => ({
      category: item.category,
      amount: Number(item._sum.totalAmount || 0),
      count: item._count._all,
    }));
  }
}
