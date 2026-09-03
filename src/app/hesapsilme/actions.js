'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitDeletionRequest(formData) {
  try {
    const name = formData.get('name')?.toString().trim();
    const username = formData.get('username')?.toString().trim();
    const phone = formData.get('phone')?.toString().trim();
    const reason = formData.get('reason')?.toString().trim();

    if (!username && !phone) {
      return { success: false, error: 'Lütfen kullanıcı adınızı veya telefon numaranızı girin.' };
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          ...(username ? [{ username }] : []),
          ...(phone ? [{ phone }] : [])
        ]
      }
    });

    await prisma.deletionRequest.create({
      data: {
        name: name || existingUser?.name || 'Belirtilmedi',
        username: username || existingUser?.username || 'Belirtilmedi',
        phone: phone || existingUser?.phone || null,
        reason: reason || 'Kullanıcı talebiyle hesap silme',
        status: 'PENDING'
      }
    });

    revalidatePath('/admin');
    revalidatePath('/admin/users');

    return { 
      success: true, 
      message: 'Hesap silme talebiniz başarıyla alındı. Yönetici onayının ardından hesabınız ve ilişkili tüm verileriniz kalıcı olarak silinecektir.' 
    };
  } catch (error) {
    console.error('Error submitting deletion request:', error);
    return { success: false, error: 'Talebiniz iletilirken bir hata oluştu. Lütfen tekrar deneyin.' };
  }
}

export async function processDeletionRequest(requestId, action) {
  try {
    const request = await prisma.deletionRequest.findUnique({
      where: { id: requestId }
    });

    if (!request) {
      return { success: false, error: 'Talep bulunamadı.' };
    }

    if (action === 'APPROVE') {
      const userToDelete = await prisma.user.findFirst({
        where: {
          OR: [
            ...(request.username && request.username !== 'Belirtilmedi' ? [{ username: request.username }] : []),
            ...(request.phone ? [{ phone: request.phone }] : [])
          ]
        }
      });

      if (userToDelete) {
        try {
          await prisma.user.delete({
            where: { id: userToDelete.id }
          });
        } catch (delError) {
          await prisma.user.update({
            where: { id: userToDelete.id },
            data: {
              isActive: false,
              name: 'Silinmiş Kullanıcı',
              phone: null,
              ibanDetails: null
            }
          });
        }
      }

      await prisma.deletionRequest.update({
        where: { id: requestId },
        data: { status: 'COMPLETED' }
      });
    } else if (action === 'REJECT') {
      await prisma.deletionRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED' }
      });
    }

    revalidatePath('/admin');
    revalidatePath('/admin/users');

    return { success: true };
  } catch (error) {
    console.error('Error processing deletion request:', error);
    return { success: false, error: 'İşlem sırasında bir hata oluştu.' };
  }
}
