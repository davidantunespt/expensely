export interface ReceiptItem {
  name: string;
  quantity: number;
  tax: number;
  total: number;
}

export interface Receipt {
  id: string;
  vendor: string;
  date: string;
  category: string;
  description: string;
  isDeductible: boolean;
  paymentMethod: string;
  taxAmount: number;
  qrCode: string;
  documentType: string;
  items: ReceiptItem[];
  totalItems: number;
  subtotalAmount: number;
  totalAmount: number;
  totalTax: number;
  totalDiscount: number;
  issuerVatNumber: string;
  buyerVatNumber: string;
  documentDate: string;
  documentId: string;
  organizationId: string;
  fileName?: string;
  fileUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReceiptFilters {
  search: string;
  category: string;
  paymentMethod: string;
  isDeductible: boolean | null;
  dateFrom: string;
  dateTo: string;
  minAmount: number | null;
  maxAmount: number | null;
}
