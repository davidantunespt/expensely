'use client';

import React from 'react';
import { Camera, FileText } from 'lucide-react';

export function UploadHeader() {
  const handleTakePhoto = () => {
    // TODO: Implement camera functionality
    console.log('Take photo clicked');
  };

  const handleBrowseFiles = () => {
    // Trigger file input click
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {/* Left side - Title and Description */}
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Upload Receipt</h1>
          <p className="text-text-secondary mt-2 text-lg">
            Upload your receipts to automatically extract expense data
          </p>
        </div>

        {/* Right side - Action Buttons */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleTakePhoto}
            className="flex items-center space-x-2 px-6 py-3 bg-primary text-text-inverse rounded-xl hover:bg-primary-700 transition-all duration-200 font-medium cursor-pointer"
          >
            <Camera className="w-5 h-5" />
            <span>Take Photo</span>
          </button>
          <button 
            onClick={handleBrowseFiles}
            className="flex items-center space-x-2 px-6 py-3 border border-border-secondary bg-bg-primary text-text-primary hover:bg-bg-muted rounded-xl transition-all duration-200 font-medium cursor-pointer"
          >
            <FileText className="w-5 h-5" />
            <span>Browse Files</span>
          </button>
        </div>
      </div>
    </div>
  );
} 