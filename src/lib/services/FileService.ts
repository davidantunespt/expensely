import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@/generated/prisma";
import { v4 as uuidv4 } from "uuid";

const BUCKET_NAME = "files";

export interface FileMetadata {
  fileId: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileHash: string;
}

export class FileService {
  private supabase;
  private prisma: PrismaClient;
  private readonly ALLOWED_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
  ];
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.prisma = new PrismaClient();
  }

  /**
   * Uploads a receipt file to Supabase Storage and updates the receipt record
   * @param file The file to upload
   * @param organizationId The organization ID
   * @param fileId The receipt ID
   */
  async uploadReceiptFile(organizationId: string, file: File, fileId?: string) {
    try {
      // Validate file
      await this.validateFile(file);

      const newfileId = fileId ?? uuidv4();
      // Generate file path and upload to Supabase
      const filePath = await this.uploadToStorage(
        organizationId,
        file,
        newfileId
      );

      // Get file metadata
      const fileData = await this.getFileMetadata(file, filePath, newfileId);

      // Update receipt record with file information
      if (fileId) {
        await this.updateReceiptFileData(fileId, fileData);
      }

      console.log("fileData UPLOADED :robot: ", fileData);
      return fileData;
    } catch (error) {
      console.error("File upload error:", error);
      throw error;
    }
  }

  /**
   * Validates file type and size
   */
  private async validateFile(file: File) {
    // Validate file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new Error(
        `Invalid file type. Allowed types: ${this.ALLOWED_TYPES.join(", ")}`
      );
    }

    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(
        `File too large. Maximum size is ${this.MAX_FILE_SIZE / 1024 / 1024}MB`
      );
    }

    // Validate file name
    if (!file.name || file.name.length > 255) {
      throw new Error("Invalid file name");
    }

    // Check for malicious file extensions
    const extension = file.name.split(".").pop()?.toLowerCase();
    const allowedExtensions = ["pdf", "jpg", "jpeg", "png"];
    if (!extension || !allowedExtensions.includes(extension)) {
      throw new Error("Invalid file extension");
    }
  }

  /**
   * Uploads file to Supabase Storage
   */
  private async uploadToStorage(
    organizationId: string,
    file: File,
    fileId: string
  ): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const filePath = `${organizationId}/${fileId}/${fileName}`;

    const { error } = await this.supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (error) throw error;

    return filePath;
  }

  /**
   * Gets file metadata including public URL
   */
  private async getFileMetadata(
    file: File,
    filePath: string,
    fileId: string
  ): Promise<FileMetadata> {
    const {
      data: { publicUrl },
    } = this.supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath, {
      download: true,
    });

    return {
      fileId,
      fileUrl: publicUrl,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileHash: await this.calculateFileHash(file),
    };
  }

  /**
   * Updates receipt record with file information
   */
  private async updateReceiptFileData(fileId: string, fileData: FileMetadata) {
    await this.prisma.receipt.updateMany({
      where: { fileId },
      data: {
        fileUrl: fileData.fileUrl,
        fileName: fileData.fileName,
        fileType: fileData.fileType,
        fileSize: fileData.fileSize,
        fileHash: fileData.fileHash,
      },
    });
  }

  /**
   * Calculates SHA-256 hash of file for deduplication
   */
  private async calculateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  /**
   * Deletes a file from storage and removes file data from receipt
   */
  async deleteReceiptFile(fileId: string) {
    try {
      // Get receipt to find file path
      const receipt = await this.prisma.receipt.findUnique({
        where: { id: fileId },
        select: { fileUrl: true },
      });

      if (!receipt?.fileUrl) return;

      // Extract file path from URL
      const filePath = receipt.fileUrl.split("/").slice(-3).join("/");

      // Delete from storage
      const { error } = await this.supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      if (error) throw error;

      // Clear file data from receipt
      await this.prisma.receipt.update({
        where: { id: fileId },
        data: {
          fileUrl: null,
          fileName: null,
          fileType: null,
          fileSize: null,
          fileHash: null,
        },
      });
    } catch (error) {
      console.error("File deletion error:", error);
      throw error;
    }
  }
}
