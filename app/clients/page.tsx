import { eq } from "drizzle-orm";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { getCurrentAccount } from "@/lib/current-account";
import { invoiceTotal } from "@/lib/invoices";
import { formatMoney } from "@/lib/money";
import { addClient } from "./actions";

export default async function ClientsPage() {
  const account = await getCurrentAccount();
  const rows = await db.query.clients.findMany({
    where: eq(clients.accountId, account.id),
    with: { invoices: { with: { items: true } } },
    orderBy: clients.name,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Clients</h1>
      <section className="rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2 font-medium">Client</th>
              <th className="px-4 py-2 font-medium">Contact</th>
              <th className="px-4 py-2 text-right font-medium">Invoices</th>
              <th className="px-4 py-2 text-right font-medium">Billed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((client) => (
              <tr key={client.id}>
                <td className="px-4 py-3 font-medium">{client.company ?? client.name}</td>
                <td className="px-4 py-3 text-gray-600">
                  {client.name} · {client.email}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{client.invoices.length}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatMoney(
                    client.invoices.reduce((sum, invoice) => sum + invoiceTotal(invoice.items), 0),
                    account.currency,
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="max-w-xl rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="font-medium">Add a client</h2>
        <form action={addClient} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input name="company" placeholder="Company" className="rounded-md border border-gray-300 px-3 py-2 text-sm sm:col-span-2" />
          <input name="name" placeholder="Contact name" required className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
          <input name="email" type="email" placeholder="Billing email" required className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
          <button className="justify-self-start rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
            Add client
          </button>
        </form>
      </section>
    </div>
  );
}
