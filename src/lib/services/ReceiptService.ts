import { prisma } from "@/lib/prisma";
import { Category, DocumentType, Receipt } from "@/generated/prisma";
import { FileService } from "@/lib/services/FileService";
import { v4 as uuidv4 } from "uuid";

const fileService = new FileService();

export type CreateReceiptData = {
  documentType: DocumentType;
  documentId: string;
  documentDate: string;
  category: Category;
  description: string;
  qrCode: string;
  vendor: string;
  isDeductible: boolean;
  paymentMethod: string;
  countryCode: string;
  countryName: string;
  issuerVatNumber: string;
  buyerVatNumber: string;
  taxAmount: number;
  totalAmount: number;
  confidence: number;
  file: File;
  items: {
    name: string;
    quantity: number;
    tax: number;
    total: number;
  }[];
};

export type UpdateReceiptData = Partial<CreateReceiptData>;

export class ReceiptService {
  /**
   * Create a new receipt for a user
   */
  static async createReceipt(
    organizationId: string,
    userId: string,
    data: CreateReceiptData
  ): Promise<Receipt> {
    const fileId = uuidv4();

    const createdReceipt = await prisma.receipt.create({
      data: {
        organizationId: organizationId,
        addedById: userId,
        totalAmount: data.totalAmount,
        category: data.category?.toUpperCase() as Category, // TODO: make this val with zod in controller
        isDeductible: data.isDeductible ?? false,
        paymentMethod: data.paymentMethod,
        taxAmount: data.taxAmount,
        confidence: data.confidence,
        documentType: data.documentType?.toUpperCase() as DocumentType, // TODO: make this val with zod in controller
        documentId: data.documentId,
        documentDate: new Date(data.documentDate).toISOString(), // TODO: make this mandatory in controller
        qrCode: data.qrCode,
        vendor: data.vendor,
        countryCode: data.countryCode,
        countryName: data.countryName,
        issuerVatNumber: data.issuerVatNumber,
        buyerVatNumber: data.buyerVatNumber,
        description: data.description,
        fileOriginalName: data.file.name,
        fileId,
        items: data.items,
      },
    });

    await fileService.uploadReceiptFile(organizationId, data.file, fileId);

    return createdReceipt;
  }

  /**
   * Get all receipts for a user
   */
  static async getUserReceipts(
    organizationId: string,
    userId: string
  ): Promise<Receipt[]> {
    return await prisma.receipt.findMany({
      where: {
        organizationId: organizationId,
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
    organizationId: string,
    userId: string
  ): Promise<Receipt | null> {
    return await prisma.receipt.findFirst({
      where: {
        id: receiptId,
        organizationId: organizationId,
        addedById: userId,
      },
    });
  }

  /**
   * Update a receipt
   */
  static async updateReceipt(
    receiptId: string,
    organizationId: string,
    userId: string,
    data: UpdateReceiptData
  ): Promise<Receipt | null> {
    // First verify the receipt belongs to the user
    const existingReceipt = await this.getReceiptById(
      receiptId,
      organizationId,
      userId
    );
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
    organizationId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const receipt = await prisma.receipt.findUnique({
        where: { id: receiptId, organizationId },
        select: { fileStoragePath: true, id: true },
      });

      if (!receipt) {
        return false;
      }

      if (receipt.fileStoragePath) {
        await fileService.deleteReceiptFile(organizationId, receipt.id);
      }

      await prisma.receipt.delete({
        where: {
          id: receiptId,
          organizationId: organizationId,
          addedById: userId,
        },
      });

      return true;
    } catch (error) {
      console.error("Error deleting receipt:", error);
      return false;
    }
  }

  /**
   * Get user's expense summary
   */
  static async getUserExpenseSummary(organizationId: string, userId: string) {
    const receipts = await prisma.receipt.findMany({
      where: {
        organizationId: organizationId,
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
  static async getReceiptCount(organizationId: string): Promise<number> {
    return await prisma.receipt.count({
      where: {
        organizationId: organizationId,
      },
    });
  }

  /**
   * Get expenses by category
   */
  static async getExpensesByCategory(organizationId: string, userId: string) {
    const categoryData = await prisma.receipt.groupBy({
      by: ["category"],
      where: {
        organizationId: organizationId,
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
