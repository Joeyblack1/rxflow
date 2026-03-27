import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { UserRole } from "@/lib/types";
export type { UserRole };

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organisationId: string;
};

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("rxflow_session")?.value;
  if (!token) return null;

  const session = await prisma.userSession.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  const u = session.user;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    organisationId: u.organisationId,
  };
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new Error("Unauthenticated");
  return session;
}

export async function login(
  email: string,
  password: string
): Promise<{ token: string; user: SessionUser } | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  const token =
    crypto.randomUUID() + "-" + crypto.randomUUID() + "-" + Date.now();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 12); // 12h

  await prisma.userSession.create({
    data: { userId: user.id, token, expiresAt },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organisationId: user.organisationId,
    },
  };
}

export async function logout(token: string) {
  await prisma.userSession.deleteMany({ where: { token } });
}

export function canPrescribe(role: UserRole) {
  return role === "PRESCRIBER";
}

export function canVerify(role: UserRole) {
  return role === "PHARMACIST" || role === "PHARMACY_TECHNICIAN";
}

export function canAdminister(role: UserRole) {
  return role === "NURSE" || role === "PRESCRIBER";
}

export function canAdmin(role: UserRole) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}
