import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === 'ADMIN' ? session : null;
}

export async function GET(_request, { params }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
  const content = await prisma.visionContent.findUnique({ where: { id: params.id } });
  if (!content) return NextResponse.json({ error: 'İçerik bulunamadı.' }, { status: 404 });
  return NextResponse.json({ content });
}

export async function PUT(request, { params }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 8 * 1024 * 1024) return NextResponse.json({ error: 'İçerik 8 MB sınırını aşıyor.' }, { status: 413 });

  const existing = await prisma.visionContent.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: 'İçerik bulunamadı.' }, { status: 404 });
  const body = await request.json();
  const title = String(body.title || '').trim().slice(0, 180);
  const allowedFormats = new Set(['fullscreen', '9:16', '16:9', '1:1']);
  if (!title || !allowedFormats.has(body.format) || JSON.stringify(body.data || {}).length > 8 * 1024 * 1024) {
    return NextResponse.json({ error: 'Geçersiz veya çok büyük içerik.' }, { status: 400 });
  }
  const content = await prisma.visionContent.update({
    where: { id: params.id },
    data: {
      title,
      format: body.format,
      durationMs: Math.max(0, Math.round(Number(body.durationMs) || 0)),
      status: body.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
      data: body.data
    },
    select: { id: true, title: true, format: true, durationMs: true, status: true, createdAt: true, updatedAt: true }
  });
  return NextResponse.json({ content });
}

export async function DELETE(_request, { params }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
  const existing = await prisma.visionContent.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: 'İçerik bulunamadı.' }, { status: 404 });
  await prisma.visionContent.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
