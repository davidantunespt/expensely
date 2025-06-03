'use client';

import React, { useState, useCallback, useImperativeHandle, forwardRef, useEffect } from 'react';
import { Upload, File, X, CheckCircle, Loader2, Eye, FileText } from 'lucide-react';
import { Box } from '@/components/UI/Box';
import { ReceiptData } from '@/lib/validations/receipt';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  status: 'uploaded' | 'processing' | 'processed' | 'rejected' | 'error';
  progress?: number;
  preview?: string;
  showSuccessButton?: boolean;
  successButtonFading?: boolean;
}

interface FileUploadAreaProps {
  onFileProcessed: (fileId: string, extractedData: ReceiptData) => void;
  onFileStatusUpdate?: (fileId: string, status: UploadedFile['status']) => void;
}

export interface FileUploadAreaRef {
  updateFileStatus: (fileId: string, status: UploadedFile['status']) => void;
}

export const FileUploadArea = forwardRef<FileUploadAreaRef, FileUploadAreaProps>(
  ({ onFileProcessed, onFileStatusUpdate }, ref) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [viewingImage, setViewingImage] = useState<{ src: string; name: string } | null>(null);

    // Handle fade-out effect for processed files
    useEffect(() => {
      uploadedFiles.forEach(file => {
        if (file.status === 'processed' && file.showSuccessButton && !file.successButtonFading) {
          // Start fade-out after 2 seconds
          const timer = setTimeout(() => {
            setUploadedFiles(prev => 
              prev.map(f => 
                f.id === file.id 
                  ? { ...f, successButtonFading: true }
                  : f
              )
            );
            
            // Remove button completely after fade transition (1 second)
            setTimeout(() => {
              setUploadedFiles(prev => 
                prev.map(f => 
                  f.id === file.id 
                    ? { ...f, showSuccessButton: false, successButtonFading: false }
                    : f
                )
              );
            }, 1000);
          }, 2000);

          return () => clearTimeout(timer);
        }
      });
    }, [uploadedFiles]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    }, []);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files);
        handleFiles(files);
      }
    }, []);

    const createFilePreview = (file: File): Promise<string | undefined> => {
      return new Promise((resolve) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => resolve(undefined);
          reader.readAsDataURL(file);
        } else {
          resolve(undefined); // No preview for non-image files
        }
      });
    };

    const handleFiles = async (files: File[]) => {
      for (const file of files) {
        const preview = await createFilePreview(file);
        
        const newFile: UploadedFile = {
          id: Date.now() + Math.random().toString(),
          name: file.name,
          size: file.size,
          type: file.type,
          file: file,
          status: 'uploaded',
          preview
        };
        
        setUploadedFiles(prev => [...prev, newFile]);
      }
    };

    const processFile = async (fileId: string) => {
      setUploadedFiles(prev => 
        prev.map(file => 
          file.id === fileId 
            ? { ...file, status: 'processing', progress: 0 }
            : file
        )
      );

      // Simulate processing with progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 25;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // Mock extracted data
          const mockExtractedData: ReceiptData = {
            vendor: "Sample Vendor",
            date: "2024-01-15",
            amount: 25.99,
            category: "Meals",
            description: "Business lunch meeting",
            isDeductible: true,
            paymentMethod: "Credit Card",
            taxAmount: 2.34
          };

          setUploadedFiles(prev => 
            prev.map(file => 
              file.id === fileId 
                ? { ...file, status: 'processed', progress: 100, showSuccessButton: true }
                : file
            )
          );
          
          // Call parent callback with extracted data
          onFileProcessed(fileId, mockExtractedData);
        } else {
          setUploadedFiles(prev => 
            prev.map(file => 
              file.id === fileId 
                ? { ...file, progress }
                : file
            )
          );
        }
      }, 300);
    };

    const removeFile = (fileId: string) => {
      setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    };

    const updateFileStatus = (fileId: string, status: UploadedFile['status']) => {
      setUploadedFiles(prev => 
        prev.map(file => 
          file.id === fileId 
            ? { ...file, status }
            : file
        )
      );
      onFileStatusUpdate?.(fileId, status);
    };

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    useImperativeHandle(ref, () => ({
      updateFileStatus: updateFileStatus,
    }));

    return (
      <>
        <Box>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Receipt Files</h3>
          
          {/* Drag & Drop Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 mb-6 ${
              isDragOver 
                ? 'border-gray-400 bg-gray-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-gray-600" />
              </div>
              
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                {isDragOver ? 'Drop files here' : 'Drag & drop files here'}
              </h4>
              
              <p className="text-base text-gray-600 mb-4">
                or click to browse files from your computer
              </p>
              
              <button className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                <span className="text-base font-medium">Choose Files</span>
              </button>
            </div>
          </div>

          {/* Individual File Cards */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-base font-medium text-gray-900">Uploaded Files</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="border border-gray-300 rounded-lg overflow-hidden h-fit">
                    <div className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                          {/* File Preview */}
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {file.preview ? (
                              <img 
                                src={file.preview} 
                                alt={file.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="flex flex-col items-center">
                                {file.type === 'application/pdf' ? (
                                  <FileText className="w-6 h-6 text-red-500" />
                                ) : (
                                  <File className="w-6 h-6 text-gray-600" />
                                )}
                              </div>
                            )}
                          </div>

                          {/* File Info */}
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-medium text-gray-900 truncate" title={file.name}>{file.name}</h5>
                            <p className="text-xs text-gray-600 mt-1">
                              {formatFileSize(file.size)}
                            </p>
                            
                            {/* Status */}
                            <div className="mt-2">
                              {file.status === 'uploaded' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Ready
                                </span>
                              )}
                              {file.status === 'processing' && (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                    Processing
                                  </span>
                                  <div className="w-full bg-gray-300 rounded-full h-1">
                                    <div 
                                      className="bg-yellow-600 h-1 rounded-full transition-all duration-300"
                                      style={{ width: `${file.progress || 0}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                              {file.status === 'processed' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Done
                                </span>
                              )}
                              {file.status === 'rejected' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  <X className="w-3 h-3 mr-1" />
                                  Rejected
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col space-y-1 ml-2">
                          {file.preview && (
                            <button
                              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                              title="View image"
                              onClick={() => {
                                setViewingImage({ src: file.preview!, name: file.name });
                              }}
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => removeFile(file.id)}
                            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Remove file"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Process Button */}
                      {(file.status === 'uploaded' || file.status === 'processing' || (file.status === 'processed' && file.showSuccessButton)) && (
                        <div className={`border-t border-gray-200 pt-3 transition-opacity duration-1000 mt-3 ${
                          file.successButtonFading ? 'opacity-0' : 'opacity-100'
                        }`}>
                          {file.status === 'uploaded' && (
                            <button
                              onClick={() => processFile(file.id)}
                              className="w-full flex items-center justify-center px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                            >
                              <span className="text-sm font-medium">Process</span>
                            </button>
                          )}
                          
                          {file.status === 'processing' && (
                            <button
                              disabled
                              className="w-full flex items-center justify-center px-3 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
                            >
                              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                              <span className="text-sm font-medium">Processing...</span>
                            </button>
                          )}
                          
                          {file.status === 'processed' && file.showSuccessButton && (
                            <button
                              disabled
                              className="w-full flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg cursor-not-allowed"
                            >
                              <CheckCircle className="w-3 h-3 mr-2" />
                              <span className="text-sm font-medium">Success!</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Box>

        {/* Image Modal */}
        {viewingImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={(e) => {
              // Close modal when clicking the backdrop
              if (e.target === e.currentTarget) {
                setViewingImage(null);
              }
            }}
          >
            <div className="relative max-w-4xl max-h-screen w-full h-full flex items-center justify-center p-4">
              <button
                onClick={() => setViewingImage(null)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2 cursor-pointer z-10"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={viewingImage.src}
                alt={viewingImage.name}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded">
                {viewingImage.name}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
);

FileUploadArea.displayName = 'FileUploadArea'; 