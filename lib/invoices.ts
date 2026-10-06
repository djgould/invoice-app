import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { invoices, type Client, type Invoice, type InvoiceItem } from "@/db/schema";
import { today } from "@/lib/dates";

export type InvoiceStatus = "draft" | "sent" | "overdue" | "paid";

export type InvoiceWithDetails = Invoice & {
  client: Client;
  items: InvoiceItem[];
};

export function invoiceTotal(items: InvoiceItem[]) {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPriceCents, 0);
}

export function displayStatus(invoice: Invoice): InvoiceStatus {
  if (invoice.status === "sent" && invoice.dueDate < today()) return "overdue";
  return invoice.status;
}

export async function listInvoices(accountId: string, status?: InvoiceStatus) {
  const rows = await db.query.invoices.findMany({
    where: eq(invoices.accountId, accountId),
    with: { client: true, items: true },
    orderBy: [desc(invoices.issueDate), desc(invoices.number)],
  });
  if (!status) return rows;
  return rows.filter((invoice) => displayStatus(invoice) === status);
}

export async function getInvoice(accountId: string, id: string) {
  return db.query.invoices.findFirst({
    where: and(eq(invoices.accountId, accountId), eq(invoices.id, id)),
    with: { client: true, items: true },
  });
}

export async function nextInvoiceNumber(accountId: string) {
  const rows = await db
    .select({ number: invoices.number })
    .from(invoices)
    .where(eq(invoices.accountId, accountId));
  const highest = rows.reduce((max, row) => {
    const n = Number.parseInt(row.number.replace(/\D/g, ""), 10);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  return `INV-${String(highest + 1).padStart(4, "0")}`;
}

export async function dashboardStats(accountId: string) {
  const rows = await listInvoices(accountId);
  const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  let outstanding = 0;
  let overdue = 0;
  let paidLast30Days = 0;
  for (const invoice of rows) {
    const total = invoiceTotal(invoice.items);
    const status = displayStatus(invoice);
    if (status === "sent" || status === "overdue") outstanding += total;
    if (status === "overdue") overdue += total;
    if (status === "paid" && invoice.paidAt && invoice.paidAt.getTime() >= monthAgo) {
      paidLast30Days += total;
    }
  }
  return { outstanding, overdue, paidLast30Days, recent: rows.slice(0, 5) };
}
