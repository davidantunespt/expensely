import React, { useState } from 'react';
import { 
  X, Calendar, DollarSign, FileText, CreditCard, 
  CheckCircle, XCircle, Download, Edit2, Trash2,
  Receipt as ReceiptIcon
} from 'lucide-react';
import { Receipt } from '@/types/receipt';
import { DeleteReceiptModal } from '@/components/ui/DeleteReceiptModal';

interface ReceiptDetailModalProps {
  receipt: Receipt;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: () => void; // Optional callback when receipt is deleted
}

export function ReceiptDetailModal({ receipt, isOpen, onClose, onDeleted }: ReceiptDetailModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Handle successful deletion
  const handleReceiptDeleted = () => {
    setShowDeleteConfirm(false);
    onClose();
    if (onDeleted) onDeleted();
  };

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
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-primary rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-border-primary shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-border-primary bg-bg-secondary">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center">
              <ReceiptIcon className="w-6 h-6 text-text-inverse" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary">{receipt.vendor}</h2>
              <p className="text-text-secondary">{receipt.documentId}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 text-accent hover:bg-bg-accent hover:text-accent rounded-lg transition-all duration-200 cursor-pointer">
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 text-text-secondary hover:bg-bg-muted rounded-lg transition-all duration-200 cursor-pointer">
              <Edit2 className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center space-x-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
            <button
              onClick={onClose}
              className="p-3 hover:bg-bg-muted rounded-xl transition-all duration-200 cursor-pointer"
            >
              <X className="w-6 h-6 text-text-muted" />
            </button>
          </div>
        </div>

        <div className="flex max-h-[calc(90vh-120px)]">
          {/* Receipt Image */}
          <div className="w-1/2 p-8 border-r border-border-primary">
            <div className="bg-bg-secondary rounded-2xl p-6 h-full flex items-center justify-center">
              {receipt.fileUrl ? (
                <img
                  src={receipt.fileUrl}
                  alt={`Receipt from ${receipt.vendor}`}
                  className="max-w-full max-h-full object-contain rounded-xl"
                />
              ) : (
                <div className="text-center">
                  <FileText className="w-16 h-16 text-secondary-200 mx-auto mb-4" />
                  <p className="text-text-secondary">Receipt image not available</p>
                </div>
              )}
            </div>
          </div>

          {/* Receipt Details */}
          <div className="w-1/2 p-8 overflow-y-auto">
            <div className="space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-xl font-bold text-text-primary mb-6">Receipt Details</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-accent" />
                    <div>
                      <div className="text-sm text-text-secondary">Date</div>
                      <div className="font-semibold text-text-primary">{formatDate(receipt.date)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-accent" />
                    <div>
                      <div className="text-sm text-text-secondary">Total Amount</div>
                      <div className="font-semibold text-text-primary text-lg">{formatCurrency(receipt.totalAmount)}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-accent" />
                    <div>
                      <div className="text-sm text-text-secondary">Category</div>
                      <div className="font-semibold text-text-primary">{receipt.category}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-accent" />
                    <div>
                      <div className="text-sm text-text-secondary">Payment Method</div>
                      <div className="font-semibold text-text-primary">{receipt.paymentMethod}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tax Information */}
              <div>
                <h4 className="text-lg font-bold text-text-primary mb-4">Tax Information</h4>
                <div className="bg-bg-secondary rounded-xl p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-text-secondary">Tax Deductible</div>
                      <div className="flex items-center space-x-2 mt-1">
                        {receipt.isDeductible ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-success-green" />
                            <span className="font-semibold text-success-green">Yes</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5 text-text-muted" />
                            <span className="font-semibold text-text-muted">No</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-text-secondary">Tax Amount</div>
                      <div className="font-semibold text-text-primary">{formatCurrency(receipt.taxAmount)}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-text-secondary">Issuer VAT</div>
                      <div className="font-mono text-sm text-text-primary">{receipt.issuerVatNumber || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-text-secondary">Buyer VAT</div>
                      <div className="font-mono text-sm text-text-primary">{receipt.buyerVatNumber || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-lg font-bold text-text-primary mb-4">Description</h4>
                <div className="bg-bg-secondary rounded-xl p-6">
                  <p className="text-text-primary">{receipt.description}</p>
                </div>
              </div>

              {/* Items Breakdown */}
              <div>
                <h4 className="text-lg font-bold text-text-primary mb-4">Items ({receipt.totalItems})</h4>
                <div className="bg-bg-secondary rounded-xl p-6">
                  <div className="space-y-3">
                    {receipt.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-border-secondary last:border-b-0">
                        <div className="flex-1">
                          <div className="font-semibold text-text-primary">{item.name}</div>
                          <div className="text-sm text-text-secondary">Qty: {item.quantity} • Tax: {item.tax}%</div>
                        </div>
                        <div className="font-semibold text-text-primary">{formatCurrency(item.total)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div>
                <h4 className="text-lg font-bold text-text-primary mb-4">Financial Summary</h4>
                <div className="bg-bg-secondary rounded-xl p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Subtotal</span>
                      <span className="font-semibold text-text-primary">{formatCurrency(receipt.subtotalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Tax</span>
                      <span className="font-semibold text-text-primary">{formatCurrency(receipt.totalTax)}</span>
                    </div>
                    {receipt.totalDiscount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Discount</span>
                        <span className="font-semibold text-success-green">-{formatCurrency(receipt.totalDiscount)}</span>
                      </div>
                    )}
                    <div className="border-t border-border-secondary pt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-bold text-text-primary">Total</span>
                        <span className="text-lg font-bold text-text-primary">{formatCurrency(receipt.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Information */}
              <div>
                <h4 className="text-lg font-bold text-text-primary mb-4">Document Information</h4>
                <div className="bg-bg-secondary rounded-xl p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-text-secondary">Document Type</div>
                      <div className="font-semibold text-text-primary">{receipt.documentType}</div>
                    </div>
                    <div>
                      <div className="text-sm text-text-secondary">File Name</div>
                      <div className="font-mono text-sm text-text-primary">{receipt.fileName || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-text-secondary">Created</div>
                      <div className="text-sm text-text-primary">{new Date(receipt.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-text-secondary">Last Updated</div>
                      <div className="text-sm text-text-primary">{new Date(receipt.updatedAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteReceiptModal
        receipt={showDeleteConfirm ? receipt : null}
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onDeleted={handleReceiptDeleted}
      />
    </div>
  );
}
