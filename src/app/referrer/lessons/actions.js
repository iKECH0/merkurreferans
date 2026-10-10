"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { createZoomMeeting } from "@/lib/zoom";
import { distributeRevenue } from "@/lib/revenueDistribution";

export async function createLesson(formData) {
  const session = await auth();
  if (!session) return { error: "Yetkisiz" };

  const title = formData.get("title");
  const studentId = formData.get("studentId");
  const startTime = formData.get("startTime");
  const endTime = formData.get("endTime");
  const price = parseFloat(formData.get("price")) || 0.0;

  if (!title || !studentId || !startTime || !endTime) {
    return { error: "Tüm alanları doldurunuz." };
  }

  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMins = Math.round((end - start) / 60000);

  if (isNaN(durationMins) || durationMins <= 0) {
    return { error: "Bitiş zamanı başlangıç zamanından sonra olmalıdır. Lütfen geçerli bir tarih ve saat seçin." };
  }
  if (durationMins > 1440) {
    return { error: "Ders süresi en fazla 24 saat (1440 dakika) olabilir." };
  }

  // ZOOM API ENTEGRASYONU
  let zoomLink = "";
  let zoomStartLink = "";
  let zoomId = "";

  const zoomMeeting = await createZoomMeeting(title, start, durationMins);
  
  if (zoomMeeting && !zoomMeeting.error) {
    zoomLink = zoomMeeting.join_url;
    zoomStartLink = zoomMeeting.start_url;
    zoomId = zoomMeeting.meeting_id;
  } else {
    return { error: zoomMeeting?.error || "Zoom API Hatası: Lütfen Zoom API anahtarlarınızı ve yetkilerinizi kontrol edin. (Ders planlanamadı)" };
  }

  try {
    await prisma.lesson.create({
      data: {
        title,
        teacherId: session.user.id,
        studentId,
        startTime: start,
        endTime: end,
        zoomLink: zoomLink,
        zoomStartLink: zoomStartLink,
        zoomMeetingId: zoomId,
        price,
        status: "SCHEDULED"
      }
    });

    revalidatePath("/referrer/lessons");
    revalidatePath("/student/lessons");
    revalidatePath("/student");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Ders oluşturulurken hata oluştu." };
  }
}

export async function executeLessonCompletion(lessonId) {
  const result = await prisma.$transaction(async (db) => {
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: { teacher: { select: { id: true, role: true, referrerId: true } }, student: { include: { referrer: true } } }
    });
    if (!lesson) return { error: "Geçersiz ders." };
    if (lesson.status === "COMPLETED") return { error: "Bu ders zaten tamamlanmış." };
    const settings = await db.settings.upsert({ where: { id: "GLOBAL" }, update: {}, create: { id: "GLOBAL" } });
    await distributeRevenue(db, {
      sourceUser: lesson.student,
      assignedTeacher: lesson.teacher,
      lessonId: lesson.id,
      totalRevenue: lesson.price,
      type: "LESSON",
      description: `Ders Ücreti - ${lesson.title}`,
      settings
    });
    await db.lesson.update({ where: { id: lessonId }, data: { status: "COMPLETED" } });
    return { success: true };
  });

  if (result?.error) return result;

  revalidatePath("/referrer/lessons");
  revalidatePath("/referrer/commissions");
  revalidatePath("/student/lessons");
  revalidatePath("/student");
  return result;
}

export async function completeLesson(lessonId) {
  const session = await auth();
  if (!session) return { error: "Yetkisiz" };

  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId }
    });

    if (!lesson || lesson.teacherId !== session.user.id) {
      return { error: "Geçersiz ders." };
    }

    return await executeLessonCompletion(lessonId);
  } catch (err) {
    console.error("Complete Lesson Error", err);
    return { error: "Ders tamamlanırken hata oluştu." };
  }
}
