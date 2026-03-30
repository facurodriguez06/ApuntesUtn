export interface StorageResult {
  url: string;      // The absolute URL to immediately access the file
  path: string;     // The exact relative path (e.g. "notes/mi-apunte.pdf")
  provider: string; // Identifier for the provider (e.g. "cloudinary", "r2")
}

export interface StorageAdapter {
  /**
   * Upload abstract method
   * @param file The file Blob/File to upload
   * @param folder The target logical folder (e.g., "notes/sistemas")
   * @param fileName The base file name without extension, e.g. "mi-apunte"
   */
  upload(file: File, folder: string, fileName: string): Promise<StorageResult>;
}
