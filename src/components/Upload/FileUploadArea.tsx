"use client";

import React, {
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from "react";
import Image from "next/image";
import {
  Upload,
  File,
  X,
  CheckCircle,
  Loader2,
  FileText,
  Brain,
  QrCode,
} from "lucide-react";
import { Box } from "@/components/UI/Box";
import { Button } from "@/components/UI/Button";
import { ReceiptData } from "@/lib/validations/receipt";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  status: "uploaded" | "processing" | "processed" | "error" | "rejected";
  progress?: number;
  preview?: string;
  showSuccessButton?: boolean;
  successButtonFading?: boolean;
}

interface FileUploadAreaProps {
  onFileProcessed: (fileId: string, extractedData: ReceiptData) => void;
  onFileStatusUpdate?: (fileId: string, status: UploadedFile["status"]) => void;
  accept?: string;
  maxSize?: number;
}

export interface FileUploadAreaRef {
  updateFileStatus: (fileId: string, status: UploadedFile["status"]) => void;
  getFile: (fileId: string) => UploadedFile | undefined;
}

export const FileUploadArea = forwardRef<
  FileUploadAreaRef,
  FileUploadAreaProps
>(({ onFileProcessed, onFileStatusUpdate, accept = "image/jpeg,image/png,application/pdf", maxSize = 10 * 1024 * 1024 }, ref) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [viewingImage, setViewingImage] = useState<{
    src: string;
    name: string;
  } | null>(null);

  // Handle fade-out effect for processed files
  useEffect(() => {
    uploadedFiles.forEach((file) => {
      if (
        file.status === "processed" &&
        file.showSuccessButton &&
        !file.successButtonFading
      ) {
        // Start fade-out after 2 seconds
        const timer = setTimeout(() => {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === file.id ? { ...f, successButtonFading: true } : f
            )
          );

          // Remove button completely after fade transition (1 second)
          setTimeout(() => {
            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.id === file.id
                  ? {
                      ...f,
                      showSuccessButton: false,
                      successButtonFading: false,
                    }
                  : f
              )
            );
          }, 1000);
        }, 2000);

        return () => clearTimeout(timer);
      }
    });
  }, [uploadedFiles]);

  const createFilePreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined); // No preview for non-image files
      }
    });
  };

  const handleFiles = useCallback(async (files: File[]) => {
    for (const file of files) {
      // Validate file size
      if (file.size > maxSize) {
        console.error(`File ${file.name} is too large. Maximum size is ${maxSize} bytes.`);
        continue;
      }

      // Validate file type
      const fileType = file.type.toLowerCase();
      const acceptedTypes = accept.split(',').map(type => type.trim());
      if (!acceptedTypes.some(type => fileType === type)) {
        console.error(`File ${file.name} has an invalid type. Accepted types are: ${accept}`);
        continue;
      }

      const preview = await createFilePreview(file);

      const newFile: UploadedFile = {
        id: Date.now() + Math.random().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
        status: "uploaded",
        preview,
      };

      setUploadedFiles((prev) => [...prev, newFile]);
    }
  }, [accept, maxSize]);

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
  }, [handleFiles]);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files);
        handleFiles(files);
      }
    },
    [handleFiles]
  );

  const processFile = async (fileId: string) => {
    setUploadedFiles((prev) =>
      prev.map((file) =>
        file.id === fileId
          ? { ...file, status: "processing", progress: 0 }
          : file
      )
    );

    try {
      // Get the file from uploaded files
      const fileToProcess = uploadedFiles.find(file => file.id === fileId);
      if (!fileToProcess) {
        throw new Error('File not found');
      }

      // Create form data for the API request
      const formData = new FormData();
      formData.append('file', fileToProcess.file);
      formData.append('organizationId', 'mock-org-id'); // In real app, get this from context/state

      // Call the receipts process API
      const response = await fetch('/api/receipts/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to process receipt: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        setUploadedFiles((prev) =>
          prev.map((file) =>
            file.id === fileId
              ? {
                  ...file,
                  status: "error",
                  progress: 0,
                }
              : file
          )
        );
        throw new Error(result.message || 'Failed to process receipt');
      }

      // Update file status to processed
      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.id === fileId
            ? {
                ...file,
                status: "processed",
                progress: 100,
              }
            : file
        )
      );

      // Call parent callback with extracted data
      onFileProcessed(fileId, result.data);
    } catch (error) {
      console.error('Error processing file:', error);
      // Update file status to error
      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.id === fileId
            ? { ...file, status: "error" }
            : file
        )
      );
      // You might want to show an error toast/notification here
    }
  };

  const processAllFiles = () => {
    const pendingFiles = uploadedFiles.filter(
      (file) => file.status === "uploaded"
    );
    pendingFiles.forEach((file) => {
      processFile(file.id);
    });
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const updateFileStatus = (fileId: string, status: UploadedFile["status"]) => {
    setUploadedFiles((prev) =>
      prev.map((file) => (file.id === fileId ? { ...file, status } : file))
    );
    onFileStatusUpdate?.(fileId, status);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const scanReceipt = async (file: UploadedFile) => {
    try {
      // Create FormData to send the file
      const formData = new FormData();
      formData.append("file", file.file);

      // Make API request to QR code scanning endpoint
      const response = await fetch("/api/receipts/qrcode", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Display successful scan results
        const qrCodeData = result.data || [];

        if (qrCodeData.length > 0) {
          const scanResults = qrCodeData
            .map(
              (item: { data: string; imagePath: string }, index: number) =>
                `QR Code ${index + 1}:\nData: ${item.data}\nImage Path: ${
                  item.imagePath
                }`
            )
            .join("\n\n");

          alert(`QR Code Scan Results for ${file.name}:

${scanResults}

Total QR codes found: ${qrCodeData.length}`);
        } else {
          alert(`QR Code Scan Results for ${file.name}:

No QR codes detected in this file.`);
        }
      } else {
        // Display error message
        alert(`QR Code Scan Failed for ${file.name}:

Error: ${result.message}`);
      }
    } catch (error) {
      console.error("QR code scan error:", error);
      alert(`QR Code Scan Failed for ${file.name}:

Network error: ${
        error instanceof Error ? error.message : "Unknown error occurred"
      }`);
    }
  };

  useImperativeHandle(ref, () => ({
    updateFileStatus: updateFileStatus,
    getFile: (fileId: string) => uploadedFiles.find(file => file.id === fileId),
  }));

  return (
    <>
      <Box style={{ backgroundColor: "white" }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Upload Receipt Files
        </h3>

        {/* Drag & Drop Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 mb-6 ${
            isDragOver
              ? "border-gray-400 bg-gray-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept={accept}
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-gray-600" />
            </div>

            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {isDragOver ? "Drop files here" : "Drag & drop files here"}
            </h4>

            <p className="text-base text-gray-600 mb-4">
              or click to browse files from your computer
            </p>

            <Button variant="primary" size="md">
              Choose Files
            </Button>
          </div>
        </div>

        {/* Individual File Cards */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-gray-50 rounded-lg overflow-hidden h-fit"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        {/* File Preview */}
                        <button
                          className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden focus:outline-none"
                          type="button"
                          title="Preview file"
                          onClick={() => {
                            if (file.preview) {
                              setViewingImage({
                                src: file.preview!,
                                name: file.name,
                              });
                            }
                          }}
                        >
                          {file.preview ? (
                            <Image
                              src={file.preview}
                              alt={file.name}
                              width={48}
                              height={48}
                              unoptimized
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="flex flex-col items-center">
                              {file.type === "application/pdf" ? (
                                <FileText className="w-6 h-6 text-red-500" />
                              ) : (
                                <File className="w-6 h-6 text-gray-600" />
                              )}
                            </div>
                          )}
                        </button>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <h5
                            className="font-medium text-gray-900 truncate"
                            title={file.name}
                          >
                            {file.name}
                          </h5>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-gray-600">
                              {formatFileSize(file.size)}
                            </p>

                            {/* Status - aligned to left after file size */}
                            <div>
                              {file.status === "uploaded" && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Ready
                                </span>
                              )}
                              {file.status === "processing" && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  Processing
                                </span>
                              )}
                              {file.status === "processed" && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Done
                                </span>
                              )}
                              {file.status === "error" && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  <X className="w-3 h-3 mr-1" />
                                  Error
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Progress bar for processing - keep this on its own line when needed */}
                          {file.status === "processing" && (
                            <div className="mt-1">
                              <div className="w-full bg-gray-300 rounded-full h-1">
                                <div
                                  className="bg-yellow-600 h-1 rounded-full transition-all duration-300"
                                  style={{ width: `${file.progress || 20}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col space-y-1 ml-2">

                        <button
                          onClick={() => removeFile(file.id)}
                          className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                          title="Remove file"
                        >
                          <X className="w-3 h-3" />
                        </button>

                        <button
                          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                          title="Scan receipt"
                          onClick={() => scanReceipt(file)}
                        >
                          <QrCode className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Process Button */}
                    {(file.status === "uploaded" ||
                      file.status === "processing" ||
                      file.status === "processed" ||
                      file.status === "error") && (
                      <div className="border-t border-gray-200 pt-3 mt-3">
                        {file.status === "uploaded" && (
                          <Button
                            variant="primary"
                            size="sm"
                            fullWidth
                            icon={<Brain />}
                            onClick={() => processFile(file.id)}
                          >
                            Process
                          </Button>
                        )}

                        {file.status === "processing" && (
                          <Button
                            variant="primary"
                            size="sm"
                            fullWidth
                            loading
                            disabled
                          >
                            Processing...
                          </Button>
                        )}

                        {(file.status === "processed" || file.status === "error") && (
                          <Button
                            variant={file.status === "processed" ? "success" : "primary"}
                            size="sm"
                            fullWidth
                            icon={file.status === "processed" ? <CheckCircle /> : <Brain />}
                            onClick={() => processFile(file.id)}
                          >
                            {file.status === "processed" ? "Process Again" : "Retry"}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="w-full">
              {uploadedFiles.some((file) => file.status === "uploaded") && (
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Brain />}
                  onClick={processAllFiles}
                >
                  Process All
                </Button>
              )}
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
            <Image
              src={viewingImage.src}
              alt={viewingImage.name}
              width={800}
              height={600}
              unoptimized
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
});

FileUploadArea.displayName = "FileUploadArea";
