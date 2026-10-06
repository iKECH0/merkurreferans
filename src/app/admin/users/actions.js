"use server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getRevenueScenario, normalizeScenarioShares } from "@/lib/revenueScenarios";
import { isTeacherRole } from "@/lib/roleConstants";

async function findTeacherInReferralChain(startUserId) {
  let currentId = startUserId;
  const visited = new Set();
  while (currentId && !visited.has(currentId) && visited.size < 20) {
    visited.add(currentId);
    const candidate = await prisma.user.findUnique({
      where: { id: currentId },
      select: { id: true, role: true, referrerId: true }
    });
    if (!candidate) return null;
    if (isTeacherRole(candidate.role)) return candidate;
    currentId = candidate.referrerId;
  }
  return null;
}

async function creditSubscriptionShare({ recipientId, sourceUser, amount, scenario, label }) {
  if (!recipientId || amount <= 0) return false;
  let wallet = await prisma.wallet.findUnique({ where: { userId: recipientId } });
  if (!wallet) wallet = await prisma.wallet.create({ data: { userId: recipientId } });
  await prisma.wallet.update({ where: { id: wallet.id }, data: { balance: { increment: amount } } });
  await prisma.walletTransaction.create({
    data: { walletId: wallet.id, amount, type: "EARNED", description: `Paket Geliri (${label}, Senaryo ${scenario}) - ${sourceUser.name || sourceUser.username}` }
  });
  await prisma.commission.create({
    data: { userId: recipientId, sourceUserId: sourceUser.id, amount, status: "PAID" }
  });
  return true;
}

export async function addStudent(formData) {
  const name = formData.get("name");
  const username = formData.get("username");
  const password = formData.get("password");
  const subscriptionMonths = formData.get("subscriptionMonths");

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
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { referrer: true } });
    if (!user) return { error: "Öğrenci bulunamadı." };
    if (user.isActive) return { error: "Öğrenci zaten aktif." };

    const subscriptionEnd = new Date();
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + parseInt(subscriptionMonths, 10));

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: true, subscriptionEnd }
    });

    const settings = await prisma.settings.findUnique({ where: { id: "GLOBAL" } });
    const totalRevenue = (settings?.commissionRate || 15) * parseInt(subscriptionMonths, 10);
    const scenario = getRevenueScenario(user);
    const teacher = await findTeacherInReferralChain(user.referrerId);
    const teacherRole = teacher?.role && isTeacherRole(teacher.role) ? teacher.role : "TEACHER";
    const shares = normalizeScenarioShares(settings?.scenarioShares, settings || {})[teacherRole][scenario];

    const teacherPaid = await creditSubscriptionShare({
      recipientId: teacher?.id,
      sourceUser: user,
      amount: totalRevenue * (shares.teacher / 100),
      scenario,
      label: `Öğretmen Payı %${shares.teacher}`
    });

    const referralParticipant = scenario === "C" ? "parent" : scenario === "D" ? "student" : null;
    const referralPaid = referralParticipant
      ? await creditSubscriptionShare({
          recipientId: user.referrerId,
          sourceUser: user,
          amount: totalRevenue * (shares[referralParticipant] / 100),
          scenario,
          label: `Referans Payı %${shares[referralParticipant]}`
        })
      : false;

    const institutionPercent = shares.institution
      + (teacherPaid ? 0 : shares.teacher)
      + shares.parent
      + shares.student
      - (referralPaid ? shares[referralParticipant] : 0);
    await prisma.institutionRevenue.create({
      data: {
        sourceUserId: user.id,
        scenario,
        amount: totalRevenue * (institutionPercent / 100),
        type: "SUBSCRIPTION",
        description: `Kurum paket payı (Senaryo ${scenario} / ${institutionPercent}%) - ${user.name || user.username}`
      }
    });

    revalidatePath("/admin/users");
    revalidatePath("/referrer");
    return { success: true };
  } catch (err) {
    console.error("Approve Error", err);
    return { error: "Öğrenci onaylanırken hata oluştu." };
  }
}
