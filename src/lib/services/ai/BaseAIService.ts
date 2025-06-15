import { AIService, AIConfig } from "../AIService";

export abstract class BaseAIService implements AIService {
  protected config: AIConfig;

  constructor(config: AIConfig) {
    this.config = {
      temperature: 0.1,
      maxTokens: 1000,
      ...config,
    };
  }

  protected async fileToBase64(file: File): Promise<{
    data: string;
    mimeType: string;
  }> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString("base64");

      return {
        data: base64,
        mimeType: file.type,
      };
    } catch {
      throw new Error("Failed to read file");
    }
  }

  protected createReceiptPrompt(fileId?: string): string {
    return `You are an expert at extracting structured data from receipt images and PDFs. 

Analyze the uploaded receipt and extract the following information in JSON format:

{
  "vendor": "Business/store name",
  "date": "YYYY-MM-DD format",
  "category": "One of: Meals, Travel, Gas, Office Supplies, Software, Marketing, Utilities, Professional Services, Equipment, Other",
  "description": "Brief description of the purchase",
  "isDeductible": "Boolean - true if likely business expense",
  "paymentMethod": "One of: Credit Card, Debit Card, Cash, Bank Transfer, Check, Digital Wallet",
  "taxAmount": "Tax amount as number if visible, otherwise calculate ~9% of amount",
  "qrCode": "QR code data if visible, otherwise empty string",
  "documentType": "One of: Receipt, Invoice, Other",
  "items": [
    {
      "name": "Item name",
      "quantity": "Number of items",
      "tax": "Tax rate as number",
      "total": "Total amount as number"
    }
  ],
  "totalItems": "Total number of items",
  "subtotalAmount": "Subtotal amount as number",
  "totalAmount": "Total amount as number",
  "totalTax": "Total tax amount as number",
  "totalDiscount": "Total discount amount as number",
  "issuerVatNumber": "Issuer VAT (or NIF or 'num contribuinte') number as string",
  "buyerVatNumber": "Buyer VAT (or NIF or 'num contribuinte') number as string",
  "documentDate": "Document date and time as string",
  "documentId": "Document ID as string"
}

Rules:
1. Extract exact information from the receipt
2. Use best judgment for category classification
3. Format date as YYYY-MM-DD hh:mm:ss
4. Set isDeductible based on business relevance
5. If tax amount isn't visible, estimate it as ~9% of total
6. Return ONLY the JSON object, no other text
7. If information is unclear, use reasonable defaults

Analyze this receipt:

${fileId ? `File ID: ${fileId}` : ""}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected calculateConfidence(data: any, fileType: string): number {
    let confidence = 85; // Base confidence

    if (data.vendor && data.vendor !== "Unknown Vendor") confidence += 5;
    if (data.totalAmount > 0) confidence += 5;
    if (data.documentDate && /^\d{4}-\d{2}-\d{2}/.test(data.documentDate))
      confidence += 5;
    if (fileType === "application/pdf") confidence += 10;

    return Math.min(95, Math.max(70, confidence));
  }

  abstract processReceipt(file: File): Promise<string>;
}
