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
}

export default function UploadReceipt() {
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const fileUploadAreaRef = useRef<FileUploadAreaRef>(null);

  const handleFileProcessed = (fileId: string, extractedData: ReceiptData) => {
    // Find the file name from the uploaded files (in a real app, you'd track this)
    const fileName = `Receipt_${fileId.slice(0, 8)}.jpg`;
    
    const processedFile: ProcessedFile = {
      fileId,
      fileName,
      data: extractedData,
      isReviewed: false,
      isCollapsed: false
    };

    setProcessedFiles(prev => [...prev, processedFile]);
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

  const handleDiscard = (fileId: string) => {
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
        <FileUploadArea onFileProcessed={handleFileProcessed} ref={fileUploadAreaRef} />
      </div>

      {/* Receipt Data Display - Only shows when files are processed */}
      {processedFiles.length > 0 && (
        <div className="mb-4">
          <ReceiptDataDisplay 
            processedFiles={processedFiles}
            onFileUpdated={handleFileUpdated}
            onDiscard={handleDiscard}
            onBulkSave={handleBulkSave}
            isSaving={isSaving}
          />
        </div>
      )}
    </div>
  );
} 