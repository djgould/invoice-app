import { eq } from "drizzle-orm";
import Link from "next/link";
import { InvoiceForm } from "@/components/invoice-form";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { getCurrentAccount } from "@/lib/current-account";
import { addDays, today } from "@/lib/dates";
import { nextInvoiceNumber } from "@/lib/invoices";
import { createInvoice } from "../actions";

export default async function NewInvoicePage() {
  const account = await getCurrentAccount();
  const accountClients = await db.query.clients.findMany({
    where: eq(clients.accountId, account.id),
    orderBy: clients.name,
  });

  if (accountClients.length === 0) {
    return (
      <p className="text-sm text-gray-600">
        Add a <Link href="/clients" className="underline">client</Link> before creating an invoice.
      </p>
    );
  }

  const issueDate = today();

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">New invoice</h1>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <InvoiceForm
          clients={accountClients}
          number={await nextInvoiceNumber(account.id)}
          issueDate={issueDate}
          dueDate={addDays(issueDate, 30)}
          action={createInvoice}
        />
      </div>
    </div>
  );
}
