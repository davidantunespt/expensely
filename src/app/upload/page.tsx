'use client';

import { useState, useRef } from 'react';
import { UploadHeader } from '@/components/Upload/UploadHeader';
import { FileUploadArea, FileUploadAreaRef } from '@/components/Upload/FileUploadArea';
import { ReceiptDataDisplay } from '@/components/Upload/ReceiptDataDisplay';
import { ReceiptData } from '@/lib/validations/receipt';

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
}

export default function UploadReceipt() {
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const fileUploadAreaRef = useRef<FileUploadAreaRef>(null);

  const handleFileProcessed = (fileId: string, extractedData: ReceiptData) => {
    // Get the file from the FileUploadArea ref
    const file = fileUploadAreaRef.current?.getFile(fileId);
    
    setProcessedFiles(prev => [
      ...prev,
      {
        fileId,
        fileName: file?.name || 'Unknown file',
        data: extractedData,
        isReviewed: false,
        isCollapsed: false,
        documentUrl: file?.preview || '',
        preview: file?.preview || '',
      }
    ]);
  };

  const handleFileUpdated = (fileId: string, updates: Partial<ProcessedFile>) => {
    setProcessedFiles(prev => 
      prev.map(file => 
        file.fileId === fileId 
          ? { ...file, ...updates }
          : file
      )
    );
  };

  const handleDiscardProcessedFile = (fileId: string) => {
    // Remove from processed files
    setProcessedFiles(prev => prev.filter(file => file.fileId !== fileId));
    
    // Update original file status to rejected
    fileUploadAreaRef.current?.updateFileStatus(fileId, 'rejected');
  };

  const handleBulkSave = async () => {
    setIsSaving(true);
    
    // Get only reviewed files
    const reviewedFiles = processedFiles.filter(file => file.isReviewed);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In a real app, you would call your API here
      console.log('Saving receipts:', reviewedFiles);
      
      // Show success message or redirect
      alert(`Successfully saved ${reviewedFiles.length} receipt${reviewedFiles.length !== 1 ? 's' : ''}!`);
      
      // Reset the form or redirect to dashboard
      setProcessedFiles([]);
      
    } catch (error) {
      console.error('Error saving receipts:', error);
      alert('Error saving receipts. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <UploadHeader />

      {/* File Upload Area */}
      <div className="mb-4">
        <FileUploadArea 
          onFileProcessed={handleFileProcessed} 
          ref={fileUploadAreaRef}
          // Add any additional props needed by FileUploadArea
          accept="image/jpeg,image/png,application/pdf"
          maxSize={10 * 1024 * 1024} // 10MB
        />
      </div>

      {/* Three-Step Flow Guide - Only shows when no files are processed */}
      {processedFiles.length === 0 && (
        <div className="mb-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">How it works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-blue-600">1</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Upload & Process</h4>
                <p className="text-sm text-gray-600">
                  Upload your receipt files and let our AI extract the data automatically
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-green-600">2</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Review & Edit</h4>
                <p className="text-sm text-gray-600">
                  Review the extracted data and make any necessary corrections
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-purple-600">3</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Save!</h4>
                <p className="text-sm text-gray-600">
                  Mark receipts as reviewed and save them to your expense tracker
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Data Display - Only shows when files are processed */}
      {processedFiles.length > 0 && (
        <div className="mb-4">
          <ReceiptDataDisplay 
            processedFiles={processedFiles}
            onFileUpdated={handleFileUpdated}
            onDiscardFile={handleDiscardProcessedFile}
            onBulkSave={handleBulkSave}
            isSaving={isSaving}
            setProcessedFiles={setProcessedFiles}
          />
        </div>
      )}
    </div>
  );
} 