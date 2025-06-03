'use client';

import React from 'react';
import { Camera, FileText } from 'lucide-react';

export function UploadHeader() {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        {/* Left side - Title and Description */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Receipt</h1>
          <p className="text-base text-gray-600">
            Upload your receipts to automatically extract expense data
          </p>
        </div>

        {/* Right side - Action Buttons */}
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
            <Camera className="w-4 h-4 mr-2" />
            <span className="text-base font-medium">Take Photo</span>
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <FileText className="w-4 h-4 mr-2" />
            <span className="text-base font-medium">Browse Files</span>
          </button>
        </div>
      </div>

      {/* Breadcrumb or additional info */}
      <div className="mt-4 pt-4 border-t border-gray-300">
        <p className="text-xs text-gray-500">
          Supported formats: JPG, PNG, PDF • Max file size: 10MB
        </p>
      </div>
    </div>
  );
} 