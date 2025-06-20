'use client';

import React, { useState } from 'react';
import { Edit2, Save, X, CheckCircle, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { Box } from '@/components/ui/Box';
import { ReceiptData } from '@/lib/validations/receipt';
import { DocumentViewer } from '@/components/ui/DocumentViewer';
import { Input } from '@/components/ui/input';
import { SelectWithLabel, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { DateTimeInput } from '@/components/ui/datetime-input';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { CheckboxWithLabel } from '@/components/ui/checkbox';

interface ProcessedFile {
  fileId: string;
  fileName: string;
  data: ReceiptData;
  isReviewed: boolean;
  isCollapsed: boolean;
  isCollapsing?: boolean;
  isDiscarding?: boolean;
  documentUrl: string;
  preview?: string;
  file: File;
}

interface ReceiptDataDisplayProps {
  processedFiles: ProcessedFile[];
  onFileUpdated: (fileId: string, updates: Partial<ProcessedFile>) => void;
  onDiscardFile: (fileId: string) => void;
}

const DATE_DISPLAY_FORMAT = 'dd/MM/yyyy, HH:mm:ss';

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
    // If in edit mode, exit it first
    if (editingFileId === fileId) {
      setEditingFileId(null);
    }

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

  const handleAddItem = (fileId: string) => {
    const file = processedFiles.find(f => f.fileId === fileId);
    if (!file) return;
    const newItem = { name: '', quantity: 1, tax: 0, total: 0 };
    onFileUpdated(fileId, {
      data: {
        ...file.data,
        items: [...file.data.items, newItem],
      },
    });
  };

  const handleRemoveItem = (fileId: string, idx: number) => {
    const file = processedFiles.find(f => f.fileId === fileId);
    if (!file) return;
    const updatedItems = file.data.items.filter((_, i) => i !== idx);
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

  function formatDateTime(dt: string, format = DATE_DISPLAY_FORMAT) {
    if (!dt) return '';
    const d = new Date(dt);
    const pad = (n: number) => n.toString().padStart(2, '0');
    // Support for 'yyyy/MM/dd, HH:mm:ss'
    return format
      .replace('yyyy', d.getFullYear().toString())
      .replace('MM', pad(d.getMonth() + 1))
      .replace('dd', pad(d.getDate()))
      .replace('HH', pad(d.getHours()))
      .replace('mm', pad(d.getMinutes()))
      .replace('ss', pad(d.getSeconds()));
  }



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
          <div
            key={file.fileId}
            className={`transition-all duration-1000 transform ${
              file.isDiscarding 
                ? "opacity-0 scale-95 translate-y-4" 
                : "opacity-100 scale-100 translate-y-0"
            }`}
          >
            <Box style={{ backgroundColor: 'white' }}>
            <div className="flex items-center justify-between">
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-semibold text-gray-900 truncate">
                    {file.fileName}
                  </h3>
                  {file.isReviewed && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <div className="text-xs text-gray-500 font-normal mt-0.5 truncate">
                  {file.data.vendor} &bull; ${file.data.totalAmount?.toFixed(2)} &bull; {formatDateTime(file.data.date, 'dd/MM/yyyy')}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {file.preview && (
                  <button
                    onClick={() => {
                      if (file.isCollapsed) {
                        handleToggleCollapse(file.fileId, file.isCollapsed);
                      }
                      setViewingFileId(viewingFileId === file.fileId ? null : file.fileId);
                    }}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                    title="View document"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => {
                    if (file.isCollapsed) {
                      handleToggleCollapse(file.fileId, file.isCollapsed);
                    }
                    setEditingFileId(editingFileId === file.fileId ? null : file.fileId);
                  }}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors cursor-pointer"
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
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                  title="Discard file"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleToggleCollapse(file.fileId, file.isCollapsed)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors cursor-pointer"
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
                <div className={`flex items-center mb-6 p-3 ${file.isReviewed ? 'bg-blue-50 border border-blue-200' : 'bg-green-50 border border-green-200'} rounded-lg mt-4`}>
                  {file.isReviewed ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-3" />
                      <div>
                        <p className="text-base font-medium text-blue-900">Document Reviewed and Ready</p>
                        <p className="text-xs text-blue-700">This receipt has been verified and is ready to be saved</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <p className="text-base font-medium text-green-900">Data Extracted Successfully</p>
                        <p className="text-xs text-green-700">Please review and edit if needed</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Receipt Data Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Vendor */}
                  <div className="space-y-2">
                    <Input
                      label="Vendor Name"
                      value={file.data.vendor}
                      onChange={(e) => handleDataUpdate(file.fileId, 'vendor', e.target.value)}
                      placeholder="Enter vendor name"
                      disabled={editingFileId !== file.fileId}
                    />
                  </div>

                  {/* Document ID */}
                  <div className="space-y-2">
                    <Input
                      label="Document ID"
                      value={file.data.documentId || ''}
                      onChange={(e) => handleDataUpdate(file.fileId, 'documentId', e.target.value)}
                      placeholder="Enter document ID"
                      disabled={editingFileId !== file.fileId}
                    />
                  </div>

                  {/* Date */}

                    <DateTimeInput
                      label="Date"
                      value={file.data.date}
                      onChange={(value) => handleDataUpdate(file.fileId, 'date', value)}
                      disabled={editingFileId !== file.fileId}
                    />


                  {/* VAT Numbers */}
                  <div className="space-y-2">
                    <Input
                      label="Issuer VAT Number"
                      value={file.data.issuerVatNumber || ''}
                      onChange={(e) => handleDataUpdate(file.fileId, 'issuerVatNumber', e.target.value)}
                      placeholder="Enter issuer VAT number"
                      disabled={editingFileId !== file.fileId}
                    />
                  </div>

                  <div className="space-y-2">
                    <div>
                      <Input
                        label="Buyer VAT Number"
                        value={file.data.buyerVatNumber || ''}
                        onChange={(e) => handleDataUpdate(file.fileId, 'buyerVatNumber', e.target.value)}
                        placeholder="Enter buyer VAT number"
                        disabled={editingFileId !== file.fileId}
                      />
                      <label className="block text-xs text-gray-600 mt-1">Should match your company VAT</label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <CurrencyInput
                        label="Total Amount"
                        value={file.data.totalAmount}
                        onChange={(value) => handleDataUpdate(file.fileId, 'totalAmount', value || 0)}
                        currency="$"
                        placeholder="0.00"
                        disabled={editingFileId !== file.fileId}
                      />
                      <CurrencyInput
                        label="Tax Amount"
                        value={file.data.totalTax}
                        onChange={(value) => handleDataUpdate(file.fileId, 'totalTax', value || 0)}
                        currency="$"
                        placeholder="0.00"
                        disabled={editingFileId !== file.fileId}
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <SelectWithLabel
                      label="Category"
                      value={file.data.category}
                      onValueChange={(value) => handleDataUpdate(file.fileId, 'category', value)}
                      disabled={editingFileId !== file.fileId}
                    >
                      <SelectTrigger className="w-full px-2 py-2 border-2 border-gray-200 rounded-lg text-gray-900 text-sm leading-none bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['Meals', 'Travel', 'Gas', 'Office Supplies', 'Software', 'Marketing', 'Utilities', 'Professional Services', 'Equipment', 'Other'].map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </SelectWithLabel>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-2">
                    <SelectWithLabel
                      label="Payment Method"
                      value={file.data.paymentMethod}
                      onValueChange={(value) => handleDataUpdate(file.fileId, 'paymentMethod', value)}
                      disabled={editingFileId !== file.fileId}
                    >
                      <SelectTrigger className="w-full px-2 py-2 border-2 border-gray-200 rounded-lg text-gray-900 text-sm leading-none bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['Credit Card', 'Debit Card', 'Cash', 'Bank Transfer', 'Check', 'Digital Wallet'].map((method) => (
                          <SelectItem key={method} value={method}>{method}</SelectItem>
                        ))}
                      </SelectContent>
                    </SelectWithLabel>
                  </div>

                  {/* Tax Deductible - Full Width */}
                  <div className="md:col-span-2 space-y-3">
                    <CheckboxWithLabel
                      checked={file.data.isDeductible}
                      onCheckedChange={(checked) => handleDataUpdate(file.fileId, 'isDeductible', checked)}
                      label="This expense is tax deductible"
                      disabled={editingFileId !== file.fileId}
                    >
                      <p className="text-sm text-gray-600">Check this box if this expense can be claimed as a business deduction.</p>
                    </CheckboxWithLabel>
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
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 w-1/2">Item</th>
                            <th className="px-2 py-2 text-right text-xs font-semibold text-gray-600 w-20">Quantity</th>
                            <th className="px-2 py-2 text-right text-xs font-semibold text-gray-600 w-24">Tax %</th>
                            <th className="px-2 py-2 text-right text-xs font-semibold text-gray-600 w-40">Total</th>
                            {editingFileId === file.fileId && (
                              <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 w-12">
                                <button
                                  type="button"
                                  className="inline-flex items-center justify-center w-6 h-6 text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                                  onClick={() => handleAddItem(file.fileId)}
                                  title="Add item"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                  </svg>
                                </button>
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {file.data.items.map((item, index) => (
                            <tr key={index} className="border-t border-gray-200">
                              {editingFileId === file.fileId ? (
                                <>
                                  <td className="px-4 py-2 text-sm text-gray-900 leading-tight">
                                    <input
                                      className="w-full px-1.5 py-1 border-2 border-gray-200 rounded-lg text-gray-900 text-sm leading-none bg-white"
                                      value={item.name}
                                      onChange={e => handleItemChange(file.fileId, index, 'name', e.target.value)}
                                    />
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900 leading-tight text-right">
                                    <input
                                      type="number"
                                      className="w-full px-1.5 py-1 border-2 border-gray-200 rounded-lg text-gray-900 text-sm leading-none bg-white text-right"
                                      value={item.quantity}
                                      min={0}
                                      onChange={e => handleItemChange(file.fileId, index, 'quantity', Number(e.target.value))}
                                    />
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900 leading-tight text-right">
                                    <input
                                      type="number"
                                      className="w-full px-1.5 py-1 border-2 border-gray-200 rounded-lg text-gray-900 text-sm leading-none bg-white text-right"
                                      value={item.tax || ''}
                                      min={0}
                                      onChange={e => handleItemChange(file.fileId, index, 'tax', Number(e.target.value))}
                                    />
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900 leading-tight text-right">
                                    <div className="relative">
                                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-600 text-sm">$</span>
                                      <input
                                        type="number"
                                        className="w-full pl-6 pr-1.5 py-1 border-2 border-gray-200 rounded-lg text-gray-900 text-sm leading-none bg-white text-right"
                                        value={item.total}
                                        min={0}
                                        onChange={e => handleItemChange(file.fileId, index, 'total', Number(e.target.value))}
                                      />
                                    </div>
                                  </td>
                                  <td className="px-2 py-2 text-center align-middle">
                                    <button
                                      type="button"
                                      className="inline-flex items-center justify-center w-6 h-6 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                                      onClick={() => handleRemoveItem(file.fileId, index)}
                                      title="Remove item"
                                    >
                                      ×
                                    </button>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="px-4 py-2 text-sm text-gray-900 leading-tight">{item.name}</td>
                                  <td className="px-4 py-2 text-sm text-gray-900 leading-tight text-right">{item.quantity}</td>
                                  <td className="px-4 py-2 text-sm text-gray-900 leading-tight text-right">{item.tax || "0"}</td>
                                  <td className="px-4 py-2 text-sm text-gray-900 leading-tight text-right">${item.total?.toFixed(2)}</td>
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
                {!file.isDiscarding && (
                  <div className="mt-6 pt-4 border-t border-gray-300 flex justify-end space-x-3 cursor-pointer">
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
          </div>
        ))}
      </div>
    </div>
  );
}