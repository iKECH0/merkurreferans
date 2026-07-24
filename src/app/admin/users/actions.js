"use server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

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
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { error: "Öğrenci bulunamadı." };
    if (user.isActive) return { error: "Öğrenci zaten aktif." };

    const subscriptionEnd = new Date();
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + parseInt(subscriptionMonths, 10));

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: true, subscriptionEnd }
    });

    // MLM: 3-Level Commission Tree
    if (user.referrerId) {
      const settings = await prisma.settings.findUnique({ where: { id: "GLOBAL" } });
      const baseCommission = settings?.commissionRate || 15.0;
      const totalCommissionAmount = baseCommission * parseInt(subscriptionMonths, 10);
      
      let currentReferrerId = user.referrerId;
      let level = 1;
      const rates = [1.0, 0.5, 0.25]; // Kademe 1: %100, Kademe 2: %50, Kademe 3: %25

      while (currentReferrerId && level <= 3) {
        const referrer = await prisma.user.findUnique({ 
          where: { id: currentReferrerId },
          include: { wallet: true }
        });
        
        if (!referrer) break;
        
        const rate = rates[level - 1];
        const commissionAmount = totalCommissionAmount * rate;
        
        if (commissionAmount > 0) {
          // Eski Commission tablosuna kayıt
          await prisma.commission.create({
            data: {
              userId: referrer.id,
              sourceUserId: user.id,
              amount: commissionAmount,
              status: "PAID" // Admin onayladığı için direkt cüzdana yansır
            }
          });
          
          // Cüzdan kontrolü ve bakiyenin artırılması
          let walletId = referrer.wallet?.id;
          if (!walletId) {
            const newWallet = await prisma.wallet.create({ data: { userId: referrer.id } });
            walletId = newWallet.id;
          }
          
          await prisma.wallet.update({
            where: { id: walletId },
            data: { balance: { increment: commissionAmount } }
          });
          
          await prisma.walletTransaction.create({
            data: {
              walletId: walletId,
              amount: commissionAmount,
              type: "EARNED",
              description: `Abonelik Satışı (Kademe ${level} Kazancı) - ${user.name || user.username}`
            }
          });
        }
        
        currentReferrerId = referrer.referrerId; // Ağaçta yukarı çık
        level++;
      }
    }

    revalidatePath("/admin/users");
    revalidatePath("/referrer");
    return { success: true };
  } catch (err) {
    console.error("Approve Error", err);
    return { error: "Öğrenci onaylanırken hata oluştu." };
  }
}
