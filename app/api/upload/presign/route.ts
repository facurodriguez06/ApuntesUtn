import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { folder, title, fileName, contentType } = await request.json();

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.R2_BUCKET_NAME || 'notes-hub-archivos';

    if (!accountId || !accessKeyId || !secretAccessKey) {
      throw new Error('Faltan credenciales de R2');
    }

    const s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });

    const originalExt = fileName.split('.').pop()?.toLowerCase() || 'pdf';
    const safeTitle = (title || fileName).replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const uniqueSuffix = Date.now();
    const finalFileName = `${safeTitle}-${uniqueSuffix}.${originalExt}`;
    const objectKey = `${folder || 'notes'}/${finalFileName}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      ContentType: contentType || 'application/octet-stream',
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return NextResponse.json({
      url,
      path: objectKey,
      provider: 'r2'
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json({ error: 'Error generando link de carga' }, { status: 500 });
  }
}
