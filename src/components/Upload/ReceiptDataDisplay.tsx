'use client';

import React, { useState } from 'react';
import { Edit2, Save, X, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Box } from '@/components/UI/Box';
import { ReceiptData } from '@/lib/validations/receipt';

interface ProcessedFile {
  fileId: string;
  fileName: string;
  data: ReceiptData;
  isReviewed: boolean;
  isCollapsed: boolean;
}

interface ReceiptDataDisplayProps {
  processedFiles: ProcessedFile[];
  onFileUpdated: (fileId: string, updates: Partial<ProcessedFile>) => void;
  onDiscard: (fileId: string) => void;
  onBulkSave: () => void;
  isSaving: boolean;
}

export function ReceiptDataDisplay({ processedFiles, onFileUpdated, onDiscard, onBulkSave, isSaving }: ReceiptDataDisplayProps) {
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editData, setEditData] = useState<ReceiptData | null>(null);

  const handleEdit = (fileId: string, data: ReceiptData) => {
    setEditData(data);
    setEditingFileId(fileId);
    // Expand the section when editing
    onFileUpdated(fileId, { isCollapsed: false });
  };

  const handleSave = (fileId: string) => {
    if (editData) {
      // Update the processed file data
      onFileUpdated(fileId, { data: editData });
    }
    setEditingFileId(null);
    setEditData(null);
  };

  const handleCancel = () => {
    setEditingFileId(null);
    setEditData(null);
  };

  const handleInputChange = (field: keyof ReceiptData, value: string | number | boolean) => {
    if (editData) {
      setEditData(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const handleMarkAsReviewed = (fileId: string) => {
    onFileUpdated(fileId, { 
      isReviewed: true, 
      isCollapsed: true 
    });
  };

  const handleToggleCollapse = (fileId: string, currentCollapsed: boolean) => {
    onFileUpdated(fileId, { isCollapsed: !currentCollapsed });
  };

  const handleDiscard = (fileId: string) => {
    // Call parent's discard handler which will remove from processed files and update file status
    onDiscard(fileId);
    
    // Clear editing state if this file was being edited
    if (editingFileId === fileId) {
      setEditingFileId(null);
      setEditData(null);
    }
  };

  const categories = [
    'Meals', 'Travel', 'Office Supplies', 'Software', 'Marketing', 
    'Utilities', 'Professional Services', 'Equipment', 'Other'
  ];

  const paymentMethods = [
    'Credit Card', 'Debit Card', 'Cash', 'Bank Transfer', 'Check', 'Digital Wallet'
  ];

  // Don't render anything if no files have been processed
  if (processedFiles.length === 0) {
    return null;
  }

  const reviewedCount = processedFiles.filter(file => file.isReviewed).length;
  const allReviewed = reviewedCount === processedFiles.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Extracted Receipt Data</h3>
        <div className="text-base text-gray-600">
          {reviewedCount} of {processedFiles.length} reviewed
        </div>
      </div>
      
      {processedFiles.map((processedFile) => {
        const { fileId, fileName, data: receiptData, isReviewed, isCollapsed } = processedFile;
        const isEditing = editingFileId === fileId;
        const currentData = isEditing ? editData! : receiptData;

        return (
          <Box key={fileId}>
            {/* Header - Always Visible */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleToggleCollapse(fileId, isCollapsed)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                >
                  {isCollapsed ? (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-base font-semibold text-gray-900">{fileName}</h4>
                    {isReviewed && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600">
                    {isCollapsed 
                      ? `${currentData.vendor} • $${currentData.amount.toFixed(2)} • ${new Date(currentData.date).toLocaleDateString()}`
                      : 'Receipt data extracted from file'
                    }
                  </p>
                </div>
              </div>
              
              {!isCollapsed && (
                <div className="flex items-center space-x-3">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => handleSave(fileId)}
                        className="flex items-center px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        <span className="text-base font-medium">Save</span>
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4 mr-2" />
                        <span className="text-base font-medium">Cancel</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEdit(fileId, receiptData)}
                      className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      <span className="text-base font-medium">Edit</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Expandable Content */}
            {!isCollapsed && (
              <>
                {/* Extraction Status */}
                <div className="flex items-center mb-6 p-3 bg-green-50 border border-green-200 rounded-lg mt-4">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="text-base font-medium text-green-900">Data Extracted Successfully</p>
                    <p className="text-xs text-green-700">Please review and edit if needed</p>
                  </div>
                </div>

                {/* Receipt Data Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Vendor */}
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      Vendor Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={currentData.vendor}
                        onChange={(e) => handleInputChange('vendor', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-base text-gray-900 py-2">{currentData.vendor}</p>
                    )}
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={currentData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-base text-gray-900 py-2">
                        {new Date(currentData.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      Amount
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        value={currentData.amount}
                        onChange={(e) => handleInputChange('amount', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-base text-gray-900 py-2">
                        ${currentData.amount.toFixed(2)}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    {isEditing ? (
                      <select
                        value={currentData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-base text-gray-900 py-2">{currentData.category}</p>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    {isEditing ? (
                      <select
                        value={currentData.paymentMethod}
                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      >
                        {paymentMethods.map((method) => (
                          <option key={method} value={method}>{method}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-base text-gray-900 py-2">{currentData.paymentMethod}</p>
                    )}
                  </div>

                  {/* Tax Amount */}
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      Tax Amount
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        value={currentData.taxAmount || 0}
                        onChange={(e) => handleInputChange('taxAmount', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-base text-gray-900 py-2">
                        ${currentData.taxAmount?.toFixed(2) || '0.00'}
                      </p>
                    )}
                  </div>

                  {/* Description - Full Width */}
                  <div className="md:col-span-2">
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    {isEditing ? (
                      <textarea
                        value={currentData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-base text-gray-900 py-2">{currentData.description}</p>
                    )}
                  </div>

                  {/* Tax Deductible - Full Width */}
                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-3">
                      {isEditing ? (
                        <input
                          type="checkbox"
                          checked={currentData.isDeductible}
                          onChange={(e) => handleInputChange('isDeductible', e.target.checked)}
                          className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                        />
                      ) : (
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          currentData.isDeductible ? 'bg-gray-600 border-gray-600' : 'border-gray-300'
                        }`}>
                          {currentData.isDeductible && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
                      )}
                      <span className="text-base font-medium text-gray-700">
                        This expense is tax deductible
                      </span>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                {!isEditing && (
                  <div className="mt-6 pt-4 border-t border-gray-300 flex justify-end space-x-3">
                    <button 
                      onClick={() => handleDiscard(fileId)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      <span className="text-base font-medium">Discard</span>
                    </button>
                    {!isReviewed ? (
                      <button 
                        onClick={() => handleMarkAsReviewed(fileId)}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        <span className="text-base font-medium">Mark as Reviewed</span>
                      </button>
                    ) : (
                      <button 
                        disabled
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg opacity-75 cursor-not-allowed"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        <span className="text-base font-medium">Reviewed</span>
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </Box>
        );
      })}

      {/* Bulk Save Button */}
      {processedFiles.length > 0 && (
        <Box>
          <div className="text-center py-6">
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Ready to Save</h4>
              <p className="text-base text-gray-600">
                {allReviewed 
                  ? `All ${processedFiles.length} receipts have been reviewed and are ready to save.`
                  : `${reviewedCount} of ${processedFiles.length} receipts reviewed. You can save reviewed receipts or review remaining items.`
                }
              </p>
            </div>
            
            {/* Loading Bar */}
            {isSaving && (
              <div className="mb-4">
                <div className="w-full bg-gray-300 rounded-full h-2 mb-2">
                  <div className="bg-gray-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                </div>
                <p className="text-base text-gray-600">Saving receipts...</p>
              </div>
            )}
            
            <button 
              onClick={onBulkSave}
              disabled={isSaving || reviewedCount === 0}
              className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium cursor-pointer"
            >
              {isSaving ? 'Saving...' : `Save ${reviewedCount > 0 ? reviewedCount : ''} Receipt${reviewedCount !== 1 ? 's' : ''}`}
            </button>
            
            {reviewedCount === 0 && (
              <p className="text-xs text-gray-500 mt-2">
                Mark at least one receipt as reviewed to enable saving
              </p>
            )}
          </div>
        </Box>
      )}
    </div>
  );
}