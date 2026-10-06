"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { getCurrentAccount } from "@/lib/current-account";

export async function updateAccount(formData: FormData) {
  const account = await getCurrentAccount();
  await db
    .update(accounts)
    .set({
      name: String(formData.get("name") ?? account.name).trim(),
      email: String(formData.get("email") ?? account.email).trim(),
      address: String(formData.get("address") ?? "").trim() || null,
      currency: String(formData.get("currency") ?? account.currency),
    })
    .where(eq(accounts.id, account.id));
  revalidatePath("/", "layout");
}
