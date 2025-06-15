'use client';

import React, { useState } from 'react';
import { Edit2, Save, X, CheckCircle, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { Box } from '@/components/UI/Box';
import { ReceiptData } from '@/lib/validations/receipt';
import { DocumentViewer } from '@/components/UI/DocumentViewer';

interface ProcessedFile {
  fileId: string;
  fileName: string;
  data: ReceiptData;
  isReviewed: boolean;
  isCollapsed: boolean;
  isCollapsing?: boolean;
  isDiscarding?: boolean;
  preview?: string;
}

interface ReceiptDataDisplayProps {
  processedFiles: ProcessedFile[];
  onFileUpdated: (fileId: string, updates: Partial<ProcessedFile>) => void;
  onDiscardFile: (fileId: string) => void;
}

export function ReceiptDataDisplay({
  processedFiles,
  onFileUpdated,
  onDiscardFile,
}: ReceiptDataDisplayProps) {
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [viewingFileId, setViewingFileId] = useState<string | null>(null);

  const handleDiscard = (fileId: string) => {
    // First, set isDiscarding to true to trigger animation
    onFileUpdated(fileId, { isDiscarding: true });

    // Clear editing state if this file was being edited
    if (editingFileId === fileId) {
      setEditingFileId(null);
    }

    // After animation completes (1 second), actually remove the file
    setTimeout(() => {
      onDiscardFile(fileId);
    }, 1000);
  };

  const handleToggleCollapse = (fileId: string, isCollapsed: boolean) => {
    onFileUpdated(fileId, { isCollapsed: !isCollapsed });
  };

  const handleMarkAsReviewed = (fileId: string) => {
    // First mark as reviewed and start collapsing
    onFileUpdated(fileId, { 
      isReviewed: true, 
      isCollapsing: true 
    });
    
    // Complete the collapse after 1 second
    setTimeout(() => {
      onFileUpdated(fileId, { 
        isCollapsed: true, 
        isCollapsing: false 
      });
    }, 1000);
  };

  const handleDataUpdate = (fileId: string, field: keyof ReceiptData, value: string | number | boolean) => {
    const file = processedFiles.find(f => f.fileId === fileId);
    if (!file) return;

    onFileUpdated(fileId, {
      data: {
        ...file.data,
        [field]: value
      }
    });
  };

  const handleItemChange = (fileId: string, idx: number, field: string, value: string | number) => {
    const file = processedFiles.find(f => f.fileId === fileId);
    if (!file) return;
    const updatedItems = file.data.items.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    );
    onFileUpdated(fileId, {
      data: {
        ...file.data,
        items: updatedItems,
      },
    });
  };

  // Don't render anything if no files have been processed
  if (processedFiles.length === 0) {
    return null;
  }

  const currentFile = processedFiles.find(f => f.fileId === viewingFileId);

  return (
    <div className="relative">
      {/* Document Viewer Side Panel */}
      <div className={`fixed top-0 left-0 h-full w-[50vw] bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
        viewingFileId ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {currentFile?.preview && (
          <DocumentViewer
            isOpen={!!viewingFileId}
            onClose={() => setViewingFileId(null)}
            documentUrl={currentFile.preview}
          />
        )}
      </div>

      {/* Main Content */}
      <div className={`space-y-4 transition-all duration-300 ${viewingFileId ? 'ml-[22vw]' : ''}`}>
        {processedFiles.map((file) => (
          <Box key={file.fileId} style={{ backgroundColor: 'white' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {file.fileName}
                </h3>
                {file.isReviewed && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Reviewed
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {file.preview && (
                  <button
                    onClick={() => setViewingFileId(viewingFileId === file.fileId ? null : file.fileId)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                    title="View document"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setEditingFileId(editingFileId === file.fileId ? null : file.fileId)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                  title={editingFileId === file.fileId ? "Save changes" : "Edit data"}
                >
                  {editingFileId === file.fileId ? (
                    <Save className="w-4 h-4" />
                  ) : (
                    <Edit2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleDiscard(file.fileId)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Discard file"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleToggleCollapse(file.fileId, file.isCollapsed)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                  title={file.isCollapsed ? "Expand" : "Collapse"}
                >
                  {file.isCollapsed ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div
              className={`transition-all duration-500 ease-in-out overflow-hidden ${
                file.isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'
              }`}
            >
              <div className="space-y-4">
                {/* Extraction Status */}
                <div className="flex items-center mb-6 p-3 bg-green-50 border border-green-200 rounded-lg mt-4">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="text-base font-medium text-green-900">Data Extracted Successfully</p>
                    <p className="text-xs text-green-700">Please review and edit if needed</p>
                  </div>
                </div>

                {/* Receipt Data Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Vendor */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 uppercase tracking-wide">
                      Vendor Name
                    </label>
                    {editingFileId === file.fileId ? (
                      <input
                        type="text"
                        value={file.data.vendor}
                        onChange={(e) => handleDataUpdate(file.fileId, 'vendor', e.target.value)}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:ring-0 transition-all duration-200 text-gray-900 placeholder-gray-400"
                        placeholder="Enter vendor name"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-lg">
                        <p className="text-gray-900 font-medium">{file.data.vendor}</p>
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 uppercase tracking-wide">
                      Date
                    </label>
                    {editingFileId === file.fileId ? (
                      <input
                        type="date"
                        value={file.data.date}
                        onChange={(e) => handleDataUpdate(file.fileId, 'date', e.target.value)}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:ring-0 transition-all duration-200 text-gray-900"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-lg">
                        <p className="text-gray-900 font-medium">
                          {new Date(file.data.date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 uppercase tracking-wide">
                      Amount
                    </label>
                    {editingFileId === file.fileId ? (
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={file.data.totalAmount}
                          onChange={(e) => handleDataUpdate(file.fileId, 'totalAmount', parseFloat(e.target.value))}
                          className="w-full pl-8 pr-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:ring-0 transition-all duration-200 text-gray-900 placeholder-gray-400"
                          placeholder="0.00"
                        />
                      </div>
                    ) : (
                      <div className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-lg">
                        <p className="text-gray-900 font-medium text-lg">
                          ${file.data.totalAmount.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 uppercase tracking-wide">
                      Category
                    </label>
                    {editingFileId === file.fileId ? (
                      <select
                        value={file.data.category}
                        onChange={(e) => handleDataUpdate(file.fileId, 'category', e.target.value)}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:ring-0 transition-all duration-200 text-gray-900 appearance-none cursor-pointer"
                      >
                        {['Meals', 'Travel', 'Gas', 'Office Supplies', 'Software', 'Marketing', 'Utilities', 'Professional Services', 'Equipment', 'Other'].map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-lg">
                        <p className="text-gray-900 font-medium">{file.data.category}</p>
                      </div>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 uppercase tracking-wide">
                      Payment Method
                    </label>
                    {editingFileId === file.fileId ? (
                      <select
                        value={file.data.paymentMethod}
                        onChange={(e) => handleDataUpdate(file.fileId, 'paymentMethod', e.target.value)}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:ring-0 transition-all duration-200 text-gray-900 appearance-none cursor-pointer"
                      >
                        {['Credit Card', 'Debit Card', 'Cash', 'Bank Transfer', 'Check', 'Digital Wallet'].map((method) => (
                          <option key={method} value={method}>{method}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-lg">
                        <p className="text-gray-900 font-medium">{file.data.paymentMethod}</p>
                      </div>
                    )}
                  </div>

                  {/* Tax Amount */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 uppercase tracking-wide">
                      Tax Amount
                    </label>
                    {editingFileId === file.fileId ? (
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={file.data.totalTax}
                          onChange={(e) => handleDataUpdate(file.fileId, 'totalTax', parseFloat(e.target.value))}
                          className="w-full pl-8 pr-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:ring-0 transition-all duration-200 text-gray-900 placeholder-gray-400"
                          placeholder="0.00"
                        />
                      </div>
                    ) : (
                      <div className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-lg">
                        <p className="text-gray-900 font-medium">
                          ${file.data.totalTax.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Notes - Full Width */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 uppercase tracking-wide">
                      Notes
                    </label>
                    {editingFileId === file.fileId ? (
                      <textarea
                        value={file.data.description || ''}
                        onChange={(e) => handleDataUpdate(file.fileId, 'description', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:ring-0 transition-all duration-200 text-gray-900 placeholder-gray-400 resize-none"
                        placeholder="Enter notes for this expense"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-lg min-h-[100px]">
                        <p className="text-gray-900 font-medium leading-relaxed">{file.data.description || 'No notes'}</p>
                      </div>
                    )}
                  </div>

                  {/* Tax Deductible - Full Width */}
                  <div className="md:col-span-2 space-y-3">
                    <label className="block text-sm font-semibold text-gray-800 uppercase tracking-wide">
                      Tax Status
                    </label>
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 border-2 border-gray-100 rounded-lg">
                      {editingFileId === file.fileId ? (
                        <input
                          type="checkbox"
                          checked={file.data.isDeductible}
                          onChange={(e) => handleDataUpdate(file.fileId, 'isDeductible', e.target.checked)}
                          className="w-5 h-5 text-gray-600 border-2 border-gray-300 rounded focus:border-gray-400 focus:ring-0 cursor-pointer"
                        />
                      ) : (
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          file.data.isDeductible 
                            ? 'bg-gray-600 border-gray-600' 
                            : 'bg-white border-gray-300'
                        }`}>
                          {file.data.isDeductible && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
                      )}
                      <div className="flex-1">
                        <span className="text-gray-900 font-medium">
                          This expense is tax deductible
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          Check this box if this expense can be claimed as a business deduction
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 uppercase tracking-wide">
                      Items ({file.data.items.length})
                    </label>
                    <div className="w-full bg-gray-50 border-2 border-gray-100 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Item</th>
                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Quantity</th>
                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Tax</th>
                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {file.data.items.map((item, index) => (
                            <tr key={index} className="border-t border-gray-200">
                              {editingFileId === file.fileId ? (
                                <>
                                  <td className="px-4 py-2 text-sm text-gray-900">
                                    <input
                                      className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-sm text-gray-900"
                                      value={item.name}
                                      onChange={e => handleItemChange(file.fileId, index, 'name', e.target.value)}
                                    />
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900 text-right">
                                    <input
                                      type="number"
                                      className="w-16 bg-white border border-gray-200 rounded px-2 py-1 text-sm text-gray-900 text-right"
                                      value={item.quantity}
                                      min={0}
                                      onChange={e => handleItemChange(file.fileId, index, 'quantity', Number(e.target.value))}
                                    />
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900 text-right">
                                    <input
                                      type="number"
                                      className="w-16 bg-white border border-gray-200 rounded px-2 py-1 text-sm text-gray-900 text-right"
                                      value={item.tax || ''}
                                      min={0}
                                      onChange={e => handleItemChange(file.fileId, index, 'tax', Number(e.target.value))}
                                    />
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900 text-right">
                                    <input
                                      type="number"
                                      className="w-20 bg-white border border-gray-200 rounded px-2 py-1 text-sm text-gray-900 text-right"
                                      value={item.total}
                                      min={0}
                                      onChange={e => handleItemChange(file.fileId, index, 'total', Number(e.target.value))}
                                    />
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                                  <td className="px-4 py-2 text-sm text-gray-900 text-right">{item.quantity}</td>
                                  <td className="px-4 py-2 text-sm text-gray-900 text-right">{item.tax || "0"}</td>
                                  <td className="px-4 py-2 text-sm text-gray-900 text-right">${item.total?.toFixed(2)}</td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50 border-t border-gray-200">
                          <tr>
                            <td colSpan={3} className="px-4 py-2 text-sm font-semibold text-gray-900 text-right">Subtotal:</td>
                            <td className="px-4 py-2 text-sm font-semibold text-gray-900 text-right">${file.data.totalAmount.toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td colSpan={3} className="px-4 py-2 text-sm font-semibold text-gray-900 text-right">Tax:</td>
                            <td className="px-4 py-2 text-sm font-semibold text-gray-900 text-right">${file.data.totalTax.toFixed(2)}</td>
                          </tr>
                          {file.data.totalDiscount > 0 && (
                            <tr>
                              <td colSpan={3} className="px-4 py-2 text-sm font-semibold text-gray-900 text-right">Discount:</td>
                              <td className="px-4 py-2 text-sm font-semibold text-gray-900 text-right">-${file.data.totalDiscount.toFixed(2)}</td>
                            </tr>
                          )}
                          <tr className="bg-gray-100">
                            <td colSpan={3} className="px-4 py-2 text-sm font-bold text-gray-900 text-right">Total:</td>
                            <td className="px-4 py-2 text-sm font-bold text-gray-900 text-right">${(file.data.totalAmount).toFixed(2)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {!editingFileId && !file.isDiscarding && (
                  <div className="mt-6 pt-4 border-t border-gray-300 flex justify-end space-x-3">
                    <button 
                      onClick={() => handleDiscard(file.fileId)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      <span className="text-base font-medium">Discard</span>
                    </button>
                    {!file.isReviewed ? (
                      <button 
                        onClick={() => handleMarkAsReviewed(file.fileId)}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span className="text-base font-medium">Mark as Reviewed</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => onFileUpdated(file.fileId, { isReviewed: false })}
                        className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                      >
                        <span className="text-base font-medium">Mark as Unreviewed</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Box>
        ))}
      </div>
    </div>
  );
}