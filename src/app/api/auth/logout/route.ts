// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers"; // Import cookies from next/headers for server-side cookie manipulation

export async function POST() {
  const response = NextResponse.json({ message: "Logged out successfully" });

  // Clear the accessToken cookie by setting its expiration to a past date
  // Ensure the cookie name, path, and other options (like httpOnly, secure, sameSite)
  // match exactly how you set it during login in your NestJS backend.
  const cookieStore = await cookies(); // ✅ await here
  cookieStore.set("accessToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
    path: "/",
    sameSite: "lax",
  });

  return response;
}
