import { z } from "zod";

// Receipt data schema for validation
export const receiptDataSchema = z.object({
  vendor: z.string().min(1, "Vendor name is required"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  amount: z.number().positive("Amount must be positive"),
  category: z.enum(
    [
      "Meals",
      "Travel",
      "Office Supplies",
      "Software",
      "Marketing",
      "Utilities",
      "Professional Services",
      "Equipment",
      "Other",
    ],
    { required_error: "Category is required" }
  ),
  description: z.string().min(1, "Description is required"),
  isDeductible: z.boolean(),
  paymentMethod: z.enum(
    [
      "Credit Card",
      "Debit Card",
      "Cash",
      "Bank Transfer",
      "Check",
      "Digital Wallet",
    ],
    { required_error: "Payment method is required" }
  ),
  taxAmount: z.number().min(0).optional(),
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
export const saveExpenseRequestSchema = receiptDataSchema.extend({
  id: z.string().uuid().optional(), // For updating existing expenses
  userId: z.string().optional(), // For user association
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Save expense response schema
export const saveExpenseResponseSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      id: z.string().uuid(),
      createdAt: z.string(),
      updatedAt: z.string(),
    })
    .optional(),
  message: z.string(),
});

// Export types
export type ReceiptData = z.infer<typeof receiptDataSchema>;
export type ReceiptProcessingResponse = z.infer<
  typeof receiptProcessingResponseSchema
>;
export type FileUpload = z.infer<typeof fileUploadSchema>;
export type SaveExpenseRequest = z.infer<typeof saveExpenseRequestSchema>;
export type SaveExpenseResponse = z.infer<typeof saveExpenseResponseSchema>;
