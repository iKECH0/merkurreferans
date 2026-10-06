"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { getScenarioForReferrerRole } from "@/lib/revenueScenarios";

export async function addReferrer(formData) {
  const name = formData.get("name");
  const username = formData.get("username");
  const password = formData.get("password");
  const referralCode = formData.get("referralCode");
  const role = formData.get("role") || "TEACHER";
  const referrerId = formData.get("referrerId"); // optional

  if (!name || !username || !password || !referralCode) {
    return { error: "Lütfen tüm alanları doldurun." };
  }

  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) return { error: "Bu kullanıcı adı alınmış." };

  const existingCode = await prisma.user.findUnique({ where: { referralCode } });
  if (existingCode) return { error: "Bu referans kodu kullanımda." };

  const hashedPassword = await bcrypt.hash(password, 10);
  const sponsor = referrerId
    ? await prisma.user.findUnique({ where: { id: referrerId }, select: { role: true } })
    : null;

  try {
    await prisma.user.create({
      data: {
        name,
        username,
        password: hashedPassword,
        referralCode,
        role: role,
        isActive: true,
        ...(referrerId ? { referrerId } : {}),
        referralScenario: sponsor ? getScenarioForReferrerRole(sponsor.role) : "A",
        referrerRoleAtJoin: sponsor?.role || null,
        wallet: {
          create: {
            balance: 0.0,
            pendingBalance: 0.0
          }
        }
      }
    });

    revalidatePath("/admin/referrals");
    return { success: true };
  } catch (error) {
    console.error("Add Referrer Error:", error);
    return { error: "Referans eklenirken hata oluştu." };
  }
}

export async function deleteReferrer(id) {
  try {
    // 1. Delete associated lessons
    await prisma.lesson.deleteMany({
      where: {
        OR: [
          { studentId: id },
          { teacherId: id }
        ]
      }
    });
    
    // 2. Unlink any referrals
    await prisma.user.updateMany({
      where: { referrerId: id },
      data: { referrerId: null }
    });

    // 3. Now delete the user
    await prisma.user.delete({ where: { id } });
    
    revalidatePath("/admin/referrals");
    return { success: true };
  } catch (err) {
    console.error("Delete Referrer Error:", err);
    return { error: "Referans silinirken hata oluştu." };
  }
}

export async function updateReferrerIban(id, ibanDetails) {
  try {
    await prisma.user.update({
      where: { id },
      data: { ibanDetails }
    });
    revalidatePath("/admin/referrals");
    return { success: true };
  } catch (err) {
    return { error: "Banka bilgileri güncellenirken hata oluştu." };
  }
}

export async function withdrawWalletBalance(walletId, amount) {
  try {
    const wallet = await prisma.wallet.findUnique({ where: { id: walletId } });
    if (!wallet) return { error: "Cüzdan bulunamadı." };
    if (wallet.balance < amount) return { error: "Yetersiz bakiye." };

    await prisma.wallet.update({
      where: { id: walletId },
      data: { balance: { decrement: amount } }
    });

    await prisma.walletTransaction.create({
      data: {
        walletId: walletId,
        amount: amount,
        type: "WITHDRAWN",
        description: `Yönetici tarafından ₺${amount} ödeme yapıldı.`
      }
    });

    // Cüzdan sahibinin tüm PENDING komisyonlarını PAID olarak işaretle
    await prisma.commission.updateMany({
      where: { 
        userId: wallet.userId,
        status: "PENDING"
      },
      data: { status: "PAID" }
    });

    revalidatePath("/admin/referrals");
    return { success: true };
  } catch (error) {
    return { error: "Ödeme işlemi sırasında hata oluştu." };
  }
}
