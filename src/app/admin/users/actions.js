"use server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { distributeRevenue, findTeacherInReferralChain } from "@/lib/revenueDistribution";

export async function addStudent(formData) {
  const name = formData.get("name");
  const username = formData.get("username");
  const password = formData.get("password");
  const subscriptionMonths = formData.get("subscriptionMonths");
  const assignedTeacherId = formData.get("assignedTeacherId") || null;

  if (!name || !username || !password || !subscriptionMonths) {
    return { error: "Lütfen tüm alanları doldurun." };
  }

  // Check if username exists
  const existingUser = await prisma.user.findUnique({
    where: { username }
  });

  if (existingUser) {
    return { error: "Bu kullanıcı adı zaten alınmış." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const months = parseInt(subscriptionMonths, 10) || 1;
  const subscriptionEnd = new Date();
  if (months === 999) {
    subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 100); // Lifetime
  } else {
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + months);
  }

  await prisma.user.create({
    data: {
      name,
      username,
      password: hashedPassword,
      role: "STUDENT",
      referralScenario: "A",
      assignedTeacherId,
      subscriptionEnd,
      isActive: true
    }
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { success: true };
}

export async function addMultipleStudents(studentsData) {
  try {
    let successCount = 0;
    for (const student of studentsData) {
      if (!student.username || !student.password) continue;
      
      const existingUser = await prisma.user.findUnique({
        where: { username: student.username }
      });
      if (existingUser) continue;

      const hashedPassword = await bcrypt.hash(student.password.toString(), 10);
      
      const subscriptionEnd = new Date();
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1); // Varsayılan 1 ay

      await prisma.user.create({
        data: {
          name: student.name || student.username,
          username: student.username,
          password: hashedPassword,
          role: "STUDENT",
          referralScenario: "A",
          subscriptionEnd,
          isActive: true
        }
      });
      successCount++;
    }
    revalidatePath("/admin/users");
    return { success: true, count: successCount };
  } catch (err) {
    console.error("Bulk Import Error", err);
    return { error: "Yükleme sırasında hata oluştu." };
  }
}

export async function resetStudentPassword(userId, newPassword) {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
    return { success: true };
  } catch (err) {
    return { error: "Şifre sıfırlanamadı." };
  }
}

export async function deleteStudent(userId) {
  try {
    // 1. Delete associated lessons
    await prisma.lesson.deleteMany({
      where: {
        OR: [
          { studentId: userId },
          { teacherId: userId }
        ]
      }
    });

    // 2. Unlink referrals
    await prisma.user.updateMany({
      where: { referrerId: userId },
      data: { referrerId: null }
    });
    await prisma.user.updateMany({ where: { assignedTeacherId: userId }, data: { assignedTeacherId: null } });

    // 3. Now delete the user
    await prisma.user.delete({
      where: { id: userId }
    });
    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error("Delete Student Error:", err);
    return { error: "Öğrenci silinirken bir hata oluştu." };
  }
}


export async function approveStudent(userId, subscriptionMonths = 1) {
  try {
    const result = await prisma.$transaction(async (db) => {
      const user = await db.user.findUnique({ where: { id: userId }, include: { referrer: true, assignedTeacher: true } });
      if (!user) return { error: "Öğrenci bulunamadı." };
      if (user.isActive) return { error: "Öğrenci zaten aktif." };
      const months = parseInt(subscriptionMonths, 10);
      const subscriptionEnd = new Date();
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + months);
      const settings = await db.settings.upsert({ where: { id: "GLOBAL" }, update: {}, create: { id: "GLOBAL" } });
      const assignedTeacher = user.assignedTeacher || await findTeacherInReferralChain(db, user.referrerId);
      await distributeRevenue(db, {
        sourceUser: user,
        assignedTeacher,
        totalRevenue: (settings.commissionRate || 15) * months,
        type: "SUBSCRIPTION",
        description: `Paket Geliri - ${user.name || user.username}`,
        settings
      });
      await db.user.update({
        where: { id: userId },
        data: { isActive: true, subscriptionEnd, assignedTeacherId: user.assignedTeacherId || assignedTeacher?.id || null }
      });
      return { success: true };
    });
    if (result?.error) return result;

    revalidatePath("/admin/users");
    revalidatePath("/referrer");
    return { success: true };
  } catch (err) {
    console.error("Approve Error", err);
    return { error: "Öğrenci onaylanırken hata oluştu." };
  }
}

export async function assignTeacher(studentId, assignedTeacherId) {
  try {
    await prisma.user.update({
      where: { id: studentId },
      data: { assignedTeacherId: assignedTeacherId || null }
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch {
    return { error: "Öğretmen ataması güncellenemedi." };
  }
}
