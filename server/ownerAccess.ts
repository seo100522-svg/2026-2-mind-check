import { eq } from "drizzle-orm";
import { users, type User } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { getDb } from "./db";

/** Allows the configured project owner, or a single legacy administrator when owner metadata is out of sync. */
export async function isProjectOwner(user: User | null | undefined) {
  if (!user) return false;
  if (ENV.ownerOpenId && user.openId === ENV.ownerOpenId) return true;
  if (user.role !== "admin") return false;
  const db = await getDb();
  if (!db) return false;
  const administrators = await db.select({ openId: users.openId }).from(users).where(eq(users.role, "admin")).limit(2);
  return administrators.length === 1 && administrators[0]?.openId === user.openId;
}
