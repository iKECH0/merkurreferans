import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { signOut } from "@/auth";

export async function GET(request) {
  try {
    await signOut({ redirect: false });
  } catch (e) {
    // ignore NextAuth internal redirect errors
  }

  const response = NextResponse.redirect(new URL("/login", request.url), 303);

  // Expire all session and auth cookies in the response
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
        response.cookies.set(cookie.name, "", {
          path: "/",
          expires: new Date(0),
          maxAge: 0,
        });
      }
    }
  } catch (e) {
    // fallback
  }

  // Explicitly wipe all known Auth.js and NextAuth cookies
  const knownAuthCookies = [
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "authjs.csrf-token",
    "__Host-authjs.csrf-token",
    "next-auth.csrf-token",
    "authjs.callback-url",
    "next-auth.callback-url",
  ];

  for (const name of knownAuthCookies) {
    response.cookies.set(name, "", {
      path: "/",
      expires: new Date(0),
      maxAge: 0,
    });
  }

  return response;
}

export async function POST(request) {
  return GET(request);
}
