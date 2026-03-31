import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { StorageAdapter, StorageResult } from "./StorageAdapter";

export class CloudflareR2Adapter implements StorageAdapter {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    this.bucketName = process.env.R2_BUCKET_NAME || "notes-hub-archivos";

    if (!accountId || !accessKeyId || !secretAccessKey) {
      throw new Error("Missing Cloudflare R2 credentials in environment variables.");
    }

    this.s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async upload(file: File, folder: string, title?: string): Promise<StorageResult> {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const originalExt = file.name.split('.').pop()?.toLowerCase() || 'pdf';
      const safeTitle = (title || file.name)
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .toLowerCase();
      
      const uniqueSuffix = Date.now();
      const fileName = `${safeTitle}-${uniqueSuffix}.${originalExt}`;
      const objectKey = `${folder}/${fileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: objectKey,
        Body: buffer,
        ContentType: file.type || "application/octet-stream",
      });

      await this.s3Client.send(command);

      // We return the relative path. 
      return {
        url: objectKey, 
        path: objectKey,
        provider: "r2",
      };
    } catch (error) {
      console.error("Cloudflare R2 Upload Error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Error uploading to Cloudflare R2"
      );
    }
  }
}
