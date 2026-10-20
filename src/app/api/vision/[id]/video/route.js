import { NextResponse } from 'next/server';
import { get } from '@vercel/blob';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
  const content = await prisma.visionContent.findUnique({ where: { id: params.id }, select: { title: true, videoUrl: true } });
  if (!content?.videoUrl) return NextResponse.json({ error: 'Kayıtlı video bulunamadı.' }, { status: 404 });
  const result = await get(content.videoUrl, { access: 'private' });
  if (!result || result.statusCode !== 200) return NextResponse.json({ error: 'Video bulunamadı.' }, { status: 404 });
  const safeTitle = content.title.replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ_-]+/g, '-');
  const inline = new URL(request.url).searchParams.get('inline') === '1';
  return new Response(result.stream, {
    headers: {
      'Content-Type': result.blob.contentType || 'video/webm',
      'Content-Length': String(result.blob.size),
      'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename="${safeTitle || 'merkur-vizyon'}.webm"`,
      'Cache-Control': 'private, no-store'
    }
  });
}
