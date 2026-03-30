import { StorageAdapter } from "./StorageAdapter";
import { CloudinaryAdapter } from "./CloudinaryAdapter";
import { CloudflareR2Adapter } from "./CloudflareR2Adapter";

export * from "./StorageAdapter";

export const getStorageAdapter = (): StorageAdapter => {
  if (process.env.STORAGE_PROVIDER === 'r2') {
    return new CloudflareR2Adapter();
  }

  // Default to Cloudinary
  return new CloudinaryAdapter();
};

/**
 * Utility to resolve relative paths back to their full CDN URLs
 * The UI can use this dynamically so that database only holds the relative 'path'
 */
export const resolveStorageUrl = (pathOrUrl: string | undefined): string => {
  if (!pathOrUrl) return "";

  // If it's already an absolute URL (for backward compatibility with old DB records)
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }

  if (process.env.NEXT_PUBLIC_R2_PUBLIC_URL) {
    const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL.replace(/\/+$/, "");
    return `${baseUrl}/${pathOrUrl}`;
  }

  // Example resolver for Cloudinary fallback
  const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/raw/upload/${pathOrUrl}`;
};
