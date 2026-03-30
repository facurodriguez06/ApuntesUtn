import { NextResponse } from 'next/server';
import { getStorageAdapter } from '@/lib/storage';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file = data.get('file');
    const folder = data.get('folder')?.toString() || 'notes';
    let title = data.get('title')?.toString();

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No se recibió ningún archivo.' },
        { status: 400 }
      );
    }
    
    if (!title || title.trim() === '') {
       title = file.name.replace(/\.[^/.]+$/, '');
    }

    const adapter = getStorageAdapter();
    const result = await adapter.upload(file, folder, title);

    return NextResponse.json({
      url: result.url,
      path: result.path,
      provider: result.provider
    });
  } catch (error) {
    console.error('Error in upload route:', error);
    const message = error instanceof Error ? error.message : 'Error al subir el archivo.';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
