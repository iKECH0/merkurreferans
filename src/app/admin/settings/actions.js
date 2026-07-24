"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

export async function updateSettings(formData) {
  const institutionName = formData.get("institutionName");
  const logoUrl = formData.get("logoUrl");
  const announcement = formData.get("announcement");
  const commissionRate = parseFloat(formData.get("commissionRate")) || 15.0;
  
  const lessonTeacherShareA = parseFloat(formData.get("lessonTeacherShareA")) || 50.0;
  const lessonTeacherShareB = parseFloat(formData.get("lessonTeacherShareB")) || 65.0;
  const leaderTeacherShare = parseFloat(formData.get("leaderTeacherShare")) || 10.0;
  const parentReferralBonus = parseFloat(formData.get("parentReferralBonus")) || 15.0;

  if (!institutionName) {
    return { error: "Kurum adı zorunludur." };
  }

  try {
    const settingsData = {
      institutionName, 
      logoUrl, 
      announcement, 
      commissionRate,
      lessonTeacherShareA,
      lessonTeacherShareB,
      leaderTeacherShare,
      parentReferralBonus
    };

    await prisma.settings.upsert({
      where: { id: "GLOBAL" },
      update: settingsData,
      create: { id: "GLOBAL", ...settingsData }
    });

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    return { error: "Ayarlar kaydedilirken hata oluştu." };
  }
}


export async function updateAdminCredentials(formData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { error: "Yetkisiz" };

  const username = formData.get("username");
  const password = formData.get("password");

  if (!username) return { error: "Kullanıcı adı zorunludur." };

  const updateData = { username };
  if (password && password.trim() !== "") {
    if (password.length < 6) return { error: "Şifre en az 6 karakter olmalıdır." };
    const hashedPassword = await bcrypt.hash(password, 10);
    updateData.password = hashedPassword;
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData
    });
    return { success: true };
  } catch (error) {
    if (error.code === 'P2002') return { error: "Bu kullanıcı adı zaten alınmış." };
    return { error: "Kimlik bilgileri güncellenirken hata oluştu." };
  }
}
