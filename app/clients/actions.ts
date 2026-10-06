"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { getCurrentAccount } from "@/lib/current-account";

export async function addClient(formData: FormData) {
  const account = await getCurrentAccount();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  if (!name || !email) throw new Error("Name and email are required");

  await db.insert(clients).values({
    accountId: account.id,
    name,
    email,
    company: String(formData.get("company") ?? "").trim() || null,
  });
  revalidatePath("/clients");
}
