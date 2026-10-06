import { eq } from "drizzle-orm";
import { connection } from "next/server";
import { db } from "@/db";
import { accounts } from "@/db/schema";

export const DEMO_ACCOUNT_ID = "0b6f3c1e-8d2a-4f57-9c3e-5a1d7e9b2c40";

// TODO: replace with real sign-in
export async function getCurrentAccount() {
  await connection();
  const account = await db.query.accounts.findFirst({
    where: eq(accounts.id, DEMO_ACCOUNT_ID),
  });
  if (!account) {
    throw new Error("Demo account not found. Run `npm run db:setup`.");
  }
  return account;
}
