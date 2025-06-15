import { z } from "zod";

// Receipt Item Schema
export const receiptItemSchema = z.object({
  name: z.string(),
  quantity: z.number().min(1),
  tax: z.number().min(0),
  total: z.number().min(0),
});

// Receipt Data Schema
export const receiptDataSchema = z.object({
  date: z.string(),
  vendor: z.string(),
  category: z.enum([
    "Meals",
    "Travel",
    "Gas",
    "Office Supplies",
    "Marketing",
    "Software",
    "Entertainment",
    "Other",
  ]),
  totalAmount: z.number().min(0),
  totalTax: z.number().min(0),
  totalDiscount: z.number().min(0),
  paymentMethod: z.string(),
  items: z.array(receiptItemSchema),
  description: z.string().optional(),
  isDeductible: z.boolean(),
  taxAmount: z.number(),
  qrCode: z.string(),
  documentType: z.enum(["Receipt", "Invoice", "Other"]),
  issuerVatNumber: z.string(),
  buyerVatNumber: z.string(),
  documentDate: z.string(),
  documentId: z.string(),
});

// API response schema
export const receiptProcessingResponseSchema = z.object({
  success: z.boolean(),
  data: receiptDataSchema.optional(),
  message: z.string(),
  confidence: z.number().min(0).max(100).optional(), // OCR confidence percentage
  extractedAt: z.string(), // ISO timestamp
});

export const qrCodeReaderResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(
    z.object({
      data: z.string(),
      imagePath: z.string(),
    })
  ),
});

// File upload schema
export const fileUploadSchema = z.object({
  file: z.instanceof(File, { message: "Valid file is required" }),
  fileName: z.string().min(1, "File name is required"),
  fileSize: z
    .number()
    .max(10 * 1024 * 1024, "File size must be less than 10MB"), // 10MB limit
  fileType: z.enum(["image/jpeg", "image/png", "application/pdf"], {
    message: "File must be JPG, PNG, or PDF",
  }),
});

// Save expense request schema
export const saveExpenseRequestSchema = z.object({
  vendor: z.string(),
  date: z.string(),
  amount: z.number(),
  category: z.string(),
  description: z.string(),
  isDeductible: z.boolean(),
  paymentMethod: z.string(),
  taxAmount: z.number().optional(),
});

// Save expense response schema
export const saveExpenseResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    id: z.string(),
    vendor: z.string(),
    date: z.string(),
    amount: z.number(),
    category: z.string(),
    description: z.string(),
    isDeductible: z.boolean(),
    paymentMethod: z.string(),
    taxAmount: z.number().optional(),
  }),
});

export type ReceiptItem = z.infer<typeof receiptItemSchema>;
export type ReceiptData = z.infer<typeof receiptDataSchema>;
export type ReceiptProcessingResponse = z.infer<
  typeof receiptProcessingResponseSchema
>;
export type FileUpload = z.infer<typeof fileUploadSchema>;
export type SaveExpenseRequest = z.infer<typeof saveExpenseRequestSchema>;
export type SaveExpenseResponse = z.infer<typeof saveExpenseResponseSchema>;
