"use server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function addStudentByReferrer(formData, referrerId) {
  const name = formData.get("name");
  const username = formData.get("username");
  const password = formData.get("password");
  const phone = formData.get("phone");
  const requestedMonths = parseInt(formData.get("requestedMonths"), 10) || 1;

  if (!name || !username || !password) {
    return { error: "Lütfen tüm zorunlu alanları doldurun." };
  }

  const existingUser = await prisma.user.findUnique({
    where: { username }
  });

  if (existingUser) {
    return { error: "Bu kullanıcı adı zaten alınmış." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        name,
        username,
        password: hashedPassword,
        phone: phone || null,
        role: "STUDENT",
        referrerId: referrerId,
        isActive: false, // Yöneticinin onaylaması gerekir
        requestedMonths: requestedMonths
      }
    });

    revalidatePath("/referrer/students");
    return { success: true };
  } catch (err) {
    console.error("Add Student By Referrer Error:", err);
    return { error: "Öğrenci eklenirken bir hata oluştu." };
  }
}

export async function deleteStudentByReferrer(studentId) {
  const session = await auth();
  if (!session) return { error: "Yetkisiz işlem." };

  try {
    const student = await prisma.user.findUnique({
      where: { id: studentId }
    });

    if (!student || (student.referrerId !== session.user.id && session.user.role !== 'ADMIN')) {
      return { error: "Bu öğrenciyi silme yetkiniz yok." };
    }

    // 1. Delete associated lessons
    await prisma.lesson.deleteMany({
      where: {
        OR: [
          { studentId: studentId },
          { teacherId: studentId }
        ]
      }
    });

    // 2. Unlink any referrals
    await prisma.user.updateMany({
      where: { referrerId: studentId },
      data: { referrerId: null }
    });

    // 3. Delete user
    await prisma.user.delete({
      where: { id: studentId }
    });

    revalidatePath("/referrer/students");
    return { success: true };
  } catch (err) {
    console.error("Delete Student Error:", err);
    return { error: "Öğrenci silinirken bir hata oluştu." };
  }
}
