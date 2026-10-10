import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const MAX_PAYLOAD_BYTES = 8 * 1024 * 1024;

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === 'ADMIN' ? session : null;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });

  const contents = await prisma.visionContent.findMany({
    orderBy: { updatedAt: 'desc' },
    select: { id: true, title: true, format: true, durationMs: true, status: true, legacyId: true, createdAt: true, updatedAt: true }
  });
  return NextResponse.json({ contents });
}

export async function POST(request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_PAYLOAD_BYTES) {
    return NextResponse.json({ error: 'İçerik 8 MB sınırını aşıyor.' }, { status: 413 });
  }

  const body = await request.json();
  const title = String(body.title || '').trim().slice(0, 180);
  const allowedFormats = new Set(['fullscreen', '9:16', '16:9', '1:1']);
  const serializedData = JSON.stringify(body.data || {});
  if (!title) return NextResponse.json({ error: 'Ders başlığı zorunludur.' }, { status: 400 });
  if (!allowedFormats.has(body.format) || serializedData.length > MAX_PAYLOAD_BYTES) {
    return NextResponse.json({ error: 'Geçersiz veya çok büyük içerik.' }, { status: 400 });
  }

  const content = await prisma.visionContent.create({
    data: {
      title,
      format: body.format,
      durationMs: Math.max(0, Math.round(Number(body.durationMs) || 0)),
      status: body.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
      data: body.data,
      ownerId: session.user.id
    },
    select: { id: true, title: true, format: true, durationMs: true, status: true, createdAt: true, updatedAt: true }
  });
  return NextResponse.json({ content }, { status: 201 });
}
