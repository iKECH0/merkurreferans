"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { getScenarioForReferrerRole } from "@/lib/revenueScenarios";
import { ROLE_OPTIONS_FOR_REFERRAL } from "@/lib/roleConstants";

export async function addTeacherToTeam(formData) {
  const session = await auth();
  if (!session) return { error: "Yetkisiz erişim." };

  const name = formData.get("name");
  const username = formData.get("username");
  const password = formData.get("password");
  const referralCode = formData.get("referralCode");
  const rawRole = formData.get("role") || "TEACHER";

  const allowedRoles = ROLE_OPTIONS_FOR_REFERRAL.map(r => r.value);
  const role = allowedRoles.includes(rawRole) ? rawRole : "TEACHER";

  if (!name || !username || !password || !referralCode) {
    return { error: "Lütfen tüm alanları doldurun." };
  }

  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) return { error: "Bu kullanıcı adı alınmış." };

  const existingCode = await prisma.user.findUnique({ where: { referralCode } });
  if (existingCode) return { error: "Bu referans kodu kullanımda." };

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const sponsor = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
    await prisma.user.create({
      data: {
        name,
        username,
        password: hashedPassword,
        referralCode,
        role: role,
        referrerId: session.user.id, // Lider öğretmenin ID'si (Sponsor)
        referrerRoleAtJoin: sponsor?.role || session.user.role,
        referralScenario: getScenarioForReferrerRole(sponsor?.role || session.user.role),
        isActive: true,
        wallet: {
          create: {
            balance: 0.0,
            pendingBalance: 0.0
          }
        }
      }
    });

    revalidatePath("/referrer/team");
    return { success: true };
  } catch (error) {
    console.error("Add Teacher Error:", error);
    return { error: "Referans eklenirken hata oluştu." };
  }
}
