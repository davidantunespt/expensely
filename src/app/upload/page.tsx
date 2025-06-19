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
  file: File;
}

export default function UploadReceipt() {
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
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
        file: file?.file || new File([], ''),
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

  const handleSaveReceipts = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    
    try {
      console.log("processedFiles", processedFiles);
      // Get only reviewed files
      const reviewedFiles = processedFiles.filter(file => file.isReviewed);
      
      // Process each file one at a time
      for (const file of reviewedFiles) {
        const originalFile = fileUploadAreaRef.current?.getFile(file.fileId)?.file;
        if (originalFile) {
          const formData = new FormData();
          formData.append('file', originalFile);
          formData.append('meta', JSON.stringify(file.data));

          const response = await fetch('/api/receipts', {
            method: 'POST',
            body: formData,
          });

          const result = await response.json();
          
          if (!response.ok || !result.success) {
            throw new Error(result.error || result.message || 'Failed to save receipt.');
          }
        }
      }

      // If all receipts were saved successfully
      setSaveSuccess(true);
      setProcessedFiles([]);
      
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save receipts.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      {/* Header Section */}
      <UploadHeader />

      {/* File Upload Area */}
      <div className="mb-8">
        <FileUploadArea 
          onFileProcessed={handleFileProcessed} 
          ref={fileUploadAreaRef}
          accept="image/jpeg,image/png,application/pdf"
          maxSize={10 * 1024 * 1024} // 10MB
        />
      </div>

      {/* Three-Step Flow Guide - Only shows when no files are processed */}
      {processedFiles.length === 0 && (
        <div className="mb-8">
          <div className="bg-bg-primary rounded-2xl border border-border-primary p-8">
            <h3 className="text-xl font-semibold text-text-primary mb-8 text-center">How it works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-text-inverse">1</span>
                </div>
                <h4 className="font-semibold text-text-primary mb-3 text-lg">Upload & Process</h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Upload your receipt files and let our AI extract the data automatically
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-text-inverse">2</span>
                </div>
                <h4 className="font-semibold text-text-primary mb-3 text-lg">Review & Edit</h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Review the extracted data and make any necessary corrections
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-highlight rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-text-primary">3</span>
                </div>
                <h4 className="font-semibold text-text-primary mb-3 text-lg">Save!</h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Mark receipts as reviewed and save them to your expense tracker
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Data Display - Only shows when files are processed */}
      {processedFiles.length > 0 && (
        <>
          <div className="mb-4">
            <ReceiptDataDisplay 
              processedFiles={processedFiles}
              onFileUpdated={handleFileUpdated}
              onDiscardFile={handleDiscardProcessedFile}
            />
          </div>

          {/* Ready to Save Section */}
          <div className="mt-10 w-full">
            <div className="bg-bg-primary border border-border-primary rounded-2xl p-8 flex flex-col items-center">
              <div className="font-bold text-lg mb-2 text-center text-text-primary">Ready to Save</div>
              <div className="text-text-secondary text-center mb-6">
                {processedFiles.filter(f => f.isReviewed).length} of {processedFiles.length} receipts reviewed. You can save reviewed receipts or review remaining items.
              </div>
              <button
                className={`px-8 py-3 rounded-xl font-medium text-lg mb-2 transition-all duration-200 flex items-center justify-center ${processedFiles.some(f => f.isReviewed) && !isSaving ? 'bg-primary text-text-inverse hover:bg-primary-700 cursor-pointer' : 'bg-secondary-400 text-text-muted cursor-not-allowed'}`}
                disabled={!processedFiles.some(f => f.isReviewed) || isSaving}
                onClick={handleSaveReceipts}
              >
                {isSaving ? (
                  <span className="flex items-center"><svg className="animate-spin h-5 w-5 mr-2 text-text-inverse" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Saving...</span>
                ) : (
                  'Save Receipts'
                )}
              </button>
              {saveSuccess && (
                <div className="text-success-green mt-2">Receipts saved successfully!</div>
              )}
              {saveError && (
                <div className="text-red-600 mt-2">{saveError}</div>
              )}
              {!processedFiles.some(f => f.isReviewed) && (
                <div className="text-xs text-gray-500 mt-1 text-center">
                  Mark at least one receipt as reviewed to enable saving
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
} 