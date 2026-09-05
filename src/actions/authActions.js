"use server";

import { signOut } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function handleSignOut() {
  try {
    await signOut({ redirect: false });
  } catch (err) {
    // ignore
  }

  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    for (const cookie of allCookies) {
      if (
        cookie.name.includes("auth") || 
        cookie.name.includes("session") || 
        cookie.name.includes("csrf") || 
        cookie.name.includes("token")
      ) {
        cookieStore.set(cookie.name, "", {
          path: "/",
          maxAge: 0,
          expires: new Date(0),
        });
        cookieStore.delete(cookie.name);
      }
    }
  } catch (err) {
    // ignore
  }

  redirect("/login");
}
