"use server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getScenarioForReferrerRole } from "@/lib/revenueScenarios";

export async function registerStudent(formData) {
  const name = formData.get("name");
  const username = formData.get("username");
  const password = formData.get("password");
  const phone = formData.get("phone");
  const referralCode = formData.get("referralCode");
  const requestedMonths = parseInt(formData.get("requestedMonths") || "1", 10);

  if (!name || !username || !password || !phone) {
    return { error: "Lütfen tüm zorunlu alanları doldurun." };
  }

  // Check if username exists
  const existingUser = await prisma.user.findUnique({
    where: { username }
  });

  if (existingUser) {
    return { error: "Bu kullanıcı adı zaten alınmış." };
  }

  const existingPhone = await prisma.user.findUnique({
    where: { phone }
  });

  if (existingPhone) {
    return { error: "Bu telefon numarası ile zaten kayıt olunmuş. Tekrar kayıt olamazsınız." };
  }

  // Handle Referral Code
  let referrerId = null;
  let referrerRoleAtJoin = null;
  let referralScenario = "A";
  if (referralCode) {
    const referrer = await prisma.user.findUnique({
      where: { referralCode }
    });
    if (referrer) {
      referrerId = referrer.id;
      referrerRoleAtJoin = referrer.role;
      referralScenario = getScenarioForReferrerRole(referrer.role);
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Generate a unique referral code for the new user
  const myReferralCode = username.toUpperCase().replace(/[^A-Z0-9]/g, '') + Math.floor(100 + Math.random() * 900);

  // Kayıt olan öğrenci onaylanana kadar pasif (isActive: false) kalır. 
  // Abonelik süresi onaylandıktan sonra başlar.
  try {
    await prisma.user.create({
      data: {
        name,
        username,
        password: hashedPassword,
        phone,
        role: "STUDENT",
        isActive: false, // Admin onayı gerektirir
        referrerId,
        referrerRoleAtJoin,
        referralScenario,
        referralCode: myReferralCode,
        requestedMonths,
        wallet: {
          create: {
            balance: 0.0,
            pendingBalance: 0.0
          }
        }
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Register Error:", error);
    return { error: "Kayıt işlemi sırasında bir hata oluştu." };
  }
}
