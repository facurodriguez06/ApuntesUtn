import { StorageAdapter, StorageResult } from "./StorageAdapter";

export class CloudinaryAdapter implements StorageAdapter {
  async upload(file: File, folder: string, fileName: string): Promise<StorageResult> {
    const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error("Cloudinary credentials are not configured.");
    }

    const publicId = `${Date.now()}-${fileName.replace(/\s+/g, "-").toLowerCase()}`;

    const formData = new FormData();
    formData.append(
      "file",
      new Blob([await file.arrayBuffer()], { type: file.type || "application/octet-stream" }),
      file.name
    );
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", folder);
    formData.append("public_id", publicId);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(result?.error?.message || "Failed to upload file to Cloudinary.");
    }

    if (!result?.secure_url) {
      throw new Error("Cloudinary did not return a secure_url.");
    }

    // result.public_id usually looks like "notes/TIMESTAMP-fileName"
    return {
      url: result.secure_url,
      path: result.public_id || `${folder}/${publicId}`,
      provider: "cloudinary"
    };
  }
}
