import React, { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { Receipt } from '@/types/receipt';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useToast } from '@/components/UI/Toast';

interface DeleteReceiptModalProps {
  receipt: Receipt | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: () => void; // Optional callback when receipt is successfully deleted
}

export function DeleteReceiptModal({ 
  receipt, 
  isOpen, 
  onClose, 
  onDeleted 
}: DeleteReceiptModalProps) {
  const { currentOrganization } = useOrganization();
  const { showSuccess, showError } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  // Format currency helper function
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  // Format date helper function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Delete receipt API call - centralized logic
  const handleDeleteReceipt = async () => {
    if (!currentOrganization?.id || !receipt) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/receipts/${receipt.id}`, {
        method: "DELETE",
        headers: {
          "x-organization-id": currentOrganization.id,
        },
      });

      const result = await response.json();

      if (result.success) {
        showSuccess(
          "Receipt deleted",
          "The receipt has been successfully deleted"
        );
        // Close modal and notify parent components
        onClose();
        if (onDeleted) onDeleted();
      } else {
        showError("Failed to delete receipt", result.error);
      }
    } catch (error) {
      console.error("Error deleting receipt:", error);
      showError("Failed to delete receipt", "Please try again later");
    } finally {
      setIsDeleting(false);
    }
  };

  // Don't render if not open or no receipt
  if (!isOpen || !receipt) return null;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
          
          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Delete Receipt
          </h3>
          
          {/* Description */}
          <p className="text-gray-600 mb-2">
            Are you sure you want to delete this receipt?
          </p>
          
          {/* Receipt Details Preview */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-gray-900">
              {receipt.vendor} - {formatCurrency(receipt.totalAmount)}
            </p>
            <p className="text-xs text-gray-500">
              {formatDate(receipt.date)} • {receipt.documentId}
            </p>
          </div>
          
          {/* Warning */}
          <p className="text-sm text-red-600 mb-6">
            This action cannot be undone.
          </p>
          
          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleDeleteReceipt}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 flex items-center justify-center cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 