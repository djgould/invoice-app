"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { clients, invoiceItems, invoices } from "@/db/schema";
import { getCurrentAccount } from "@/lib/current-account";
import { parseMoney } from "@/lib/money";

type ItemInput = { description: string; quantity: string; price: string };

export async function createInvoice(formData: FormData) {
  const account = await getCurrentAccount();
  const clientId = String(formData.get("clientId"));

  const client = await db.query.clients.findFirst({
    where: and(eq(clients.id, clientId), eq(clients.accountId, account.id)),
  });
  if (!client) throw new Error("Client not found");

  const items = (JSON.parse(String(formData.get("items") ?? "[]")) as ItemInput[])
    .filter((item) => item.description.trim())
    .map((item) => ({
      description: item.description.trim(),
      quantity: Math.max(1, Number.parseInt(item.quantity, 10) || 1),
      unitPriceCents: parseMoney(item.price),
    }));
  if (items.length === 0) throw new Error("Add at least one line item");

  const [invoice] = await db
    .insert(invoices)
    .values({
      accountId: account.id,
      clientId: client.id,
      number: String(formData.get("number")),
      issueDate: String(formData.get("issueDate")),
      dueDate: String(formData.get("dueDate")),
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .returning();

  await db.insert(invoiceItems).values(items.map((item) => ({ ...item, invoiceId: invoice.id })));

  revalidatePath("/");
  redirect(`/invoices/${invoice.id}`);
}

async function setStatus(id: string, status: "sent" | "paid") {
  const account = await getCurrentAccount();
  await db
    .update(invoices)
    .set({ status, paidAt: status === "paid" ? new Date() : null })
    .where(and(eq(invoices.id, id), eq(invoices.accountId, account.id)));
  revalidatePath("/");
  revalidatePath(`/invoices/${id}`);
}

export async function markInvoiceSent(id: string) {
  await setStatus(id, "sent");
}

export async function markInvoicePaid(id: string) {
  await setStatus(id, "paid");
}
