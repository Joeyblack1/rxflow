"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { login, logout, getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

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
    maxAge: 60 * 60 * 12,
    path: "/",
  });

  const user = await prisma.user.findUnique({ where: { id: result.user.id } });
  if (user?.mustChangePassword) {
    redirect("/change-password");
  }

  redirect("/dashboard");
}

export async function changePasswordAction(currentPassword: string, newPassword: string) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return { error: "User not found" };

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return { error: "Current password is incorrect" };

  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hash, mustChangePassword: false },
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
