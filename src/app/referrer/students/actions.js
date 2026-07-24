"use server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

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
