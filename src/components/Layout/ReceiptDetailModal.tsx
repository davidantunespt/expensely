import React from 'react';
import { 
  X, Calendar, DollarSign, FileText, CreditCard, 
  CheckCircle, XCircle, Download, Edit2, Trash2,
  Receipt as ReceiptIcon
} from 'lucide-react';
import { Receipt } from '@/types/receipt';

interface ReceiptDetailModalProps {
  receipt: Receipt;
  isOpen: boolean;
  onClose: () => void;
}

export function ReceiptDetailModal({ receipt, isOpen, onClose }: ReceiptDetailModalProps) {
  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-200 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-200 bg-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#19e2c0] rounded-2xl flex items-center justify-center">
              <ReceiptIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{receipt.vendor}</h2>
              <p className="text-gray-500">{receipt.documentId}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 text-[#19e2c0] hover:bg-[#e6fcf7] hover:text-[#19e2c0] rounded-lg transition-all duration-200">
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200">
              <Edit2 className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200">
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
            <button
              onClick={onClose}
              className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex max-h-[calc(90vh-120px)]">
          {/* Receipt Image */}
          <div className="w-1/2 p-8 border-r border-gray-200">
            <div className="bg-gray-100 rounded-2xl p-6 h-full flex items-center justify-center">
              {receipt.fileUrl ? (
                <img
                  src={receipt.fileUrl}
                  alt={`Receipt from ${receipt.vendor}`}
                  className="max-w-full max-h-full object-contain rounded-xl"
                />
              ) : (
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500">Receipt image not available</p>
                </div>
              )}
            </div>
          </div>

          {/* Receipt Details */}
          <div className="w-1/2 p-8 overflow-y-auto">
            <div className="space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6">Receipt Details</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-[#19e2c0]" />
                    <div>
                      <div className="text-sm text-gray-500">Date</div>
                      <div className="font-semibold text-gray-800">{formatDate(receipt.date)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-[#19e2c0]" />
                    <div>
                      <div className="text-sm text-gray-500">Total Amount</div>
                      <div className="font-semibold text-gray-800 text-lg">{formatCurrency(receipt.totalAmount)}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-[#19e2c0]" />
                    <div>
                      <div className="text-sm text-gray-500">Category</div>
                      <div className="font-semibold text-gray-800">{receipt.category}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-[#19e2c0]" />
                    <div>
                      <div className="text-sm text-gray-500">Payment Method</div>
                      <div className="font-semibold text-gray-800">{receipt.paymentMethod}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tax Information */}
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-4">Tax Information</h4>
                <div className="bg-gray-100 rounded-xl p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-500">Tax Deductible</div>
                      <div className="flex items-center space-x-2 mt-1">
                        {receipt.isDeductible ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-[#19e2c0]" />
                            <span className="font-semibold text-[#19e2c0]">Yes</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5 text-gray-400" />
                            <span className="font-semibold text-gray-400">No</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Tax Amount</div>
                      <div className="font-semibold text-gray-800">{formatCurrency(receipt.taxAmount)}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Issuer VAT</div>
                      <div className="font-mono text-sm text-gray-800">{receipt.issuerVatNumber || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Buyer VAT</div>
                      <div className="font-mono text-sm text-gray-800">{receipt.buyerVatNumber || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-4">Description</h4>
                <div className="bg-gray-100 rounded-xl p-6">
                  <p className="text-gray-700">{receipt.description}</p>
                </div>
              </div>

              {/* Items Breakdown */}
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-4">Items ({receipt.totalItems})</h4>
                <div className="bg-gray-100 rounded-xl p-6">
                  <div className="space-y-3">
                    {receipt.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">{item.name}</div>
                          <div className="text-sm text-gray-500">Qty: {item.quantity} • Tax: {item.tax}%</div>
                        </div>
                        <div className="font-semibold text-gray-800">{formatCurrency(item.total)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-4">Financial Summary</h4>
                <div className="bg-gray-100 rounded-xl p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-semibold text-gray-800">{formatCurrency(receipt.subtotalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tax</span>
                      <span className="font-semibold text-gray-800">{formatCurrency(receipt.totalTax)}</span>
                    </div>
                    {receipt.totalDiscount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Discount</span>
                        <span className="font-semibold text-[#19e2c0]">-{formatCurrency(receipt.totalDiscount)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-bold text-gray-800">Total</span>
                        <span className="text-lg font-bold text-gray-800">{formatCurrency(receipt.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Information */}
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-4">Document Information</h4>
                <div className="bg-gray-100 rounded-xl p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Document Type</div>
                      <div className="font-semibold text-gray-800">{receipt.documentType}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">File Name</div>
                      <div className="font-mono text-sm text-gray-800">{receipt.fileName || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Created</div>
                      <div className="text-sm text-gray-800">{receipt.createdAt.toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Last Updated</div>
                      <div className="text-sm text-gray-800">{receipt.updatedAt.toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
