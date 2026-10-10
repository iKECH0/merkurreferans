import { NextResponse } from 'next/server';
import { handleUpload } from '@vercel/blob/client';
import { auth } from '@/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const session = await auth();
    if (body.type === 'blob.generate-client-token' && session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
    }
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith('vision/') || !pathname.endsWith('.webm')) throw new Error('Geçersiz dosya yolu.');
        return {
          allowedContentTypes: ['video/webm'],
          maximumSizeInBytes: 500 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ adminId: session?.user?.id || 'verified-callback' })
        };
      }
    });
    return NextResponse.json(response);
  } catch (error) {
    console.error('Vision upload error:', error);
    return NextResponse.json({ error: 'Video yüklenemedi.' }, { status: 400 });
  }
}
