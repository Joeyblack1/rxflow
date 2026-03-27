"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { login, logout } from "@/lib/auth";

export async function loginAction(email: string, password: string) {
  const result = await login(email, password);
  if (!result) {
    return { error: "Invalid email or password" };
  }

  const cookieStore = await cookies();
  cookieStore.set("rxflow_session", result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 12, // 12 hours
    path: "/",
  });

  redirect("/dashboard");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("rxflow_session")?.value;
  if (token) {
    await logout(token);
    cookieStore.delete("rxflow_session");
  }
  redirect("/login");
}
