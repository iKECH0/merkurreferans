"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { createZoomMeeting } from "@/lib/zoom";
import { getRevenueScenario, normalizeScenarioShares } from "@/lib/revenueScenarios";
import { isTeacherRole } from "@/lib/roleConstants";

async function creditRevenueShare({ userId, sourceUserId, lesson, amount, description }) {
  if (!userId || amount <= 0) return;

  let wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) wallet = await prisma.wallet.create({ data: { userId } });

  await prisma.wallet.update({
    where: { id: wallet.id },
    data: { balance: { increment: amount } }
  });
  await prisma.walletTransaction.create({
    data: { walletId: wallet.id, amount, type: "EARNED", description }
  });
  await prisma.commission.create({
    data: { userId, sourceUserId, lessonId: lesson.id, amount, status: "PAID" }
  });
}

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
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { teacher: true, student: { include: { referrer: true } } }
  });

  if (!lesson) {
    return { error: "Geçersiz ders." };
  }
  
  if (lesson.status === "COMPLETED") {
    return { error: "Bu ders zaten tamamlanmış." };
  }

  let settings = await prisma.settings.findUnique({ where: { id: "GLOBAL" } });
  if (!settings) {
    settings = await prisma.settings.create({ data: { id: "GLOBAL" } });
  }

  const scenario = getRevenueScenario(lesson.student, lesson.teacherId);
  const teacherRole = isTeacherRole(lesson.teacher.role) ? lesson.teacher.role : "TEACHER";
  const matrix = normalizeScenarioShares(settings.scenarioShares, settings);
  const shares = matrix[teacherRole][scenario];

  await creditRevenueShare({
    userId: lesson.teacherId,
    sourceUserId: lesson.studentId,
    lesson,
    amount: lesson.price * (shares.teacher / 100),
    description: `Ders Ücreti (Senaryo ${scenario} / ${shares.teacher}% öğretmen payı) - ${lesson.title}`
  });

  const referralParticipant = scenario === "C" ? "parent" : scenario === "D" ? "student" : null;
  if (referralParticipant && lesson.student.referrerId) {
    await creditRevenueShare({
      userId: lesson.student.referrerId,
      sourceUserId: lesson.studentId,
      lesson,
      amount: lesson.price * (shares[referralParticipant] / 100),
      description: `Referans Payı (Senaryo ${scenario} / ${shares[referralParticipant]}%) - ${lesson.title}`
    });
  }

  // Dersi tamamlandı olarak işaretle
  await prisma.lesson.update({
    where: { id: lessonId },
    data: { status: "COMPLETED" }
  });

  revalidatePath("/referrer/lessons");
  revalidatePath("/referrer/commissions");
  revalidatePath("/student/lessons");
  revalidatePath("/student");
  return { success: true };
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
