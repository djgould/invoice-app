import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { getCurrentAccount } from "@/lib/current-account";
import { formatDate } from "@/lib/dates";
import { displayStatus, getInvoice, invoiceTotal } from "@/lib/invoices";
import { formatMoney } from "@/lib/money";
import { markInvoicePaid, markInvoiceSent } from "../actions";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const account = await getCurrentAccount();
  const invoice = await getInvoice(account.id, id);
  if (!invoice) notFound();

  const status = displayStatus(invoice);
  const money = (cents: number) => formatMoney(cents, account.currency);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{invoice.number}</h1>
            <StatusBadge status={status} />
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Issued {formatDate(invoice.issueDate)} · Due {formatDate(invoice.dueDate)}
          </p>
        </div>
        <div className="flex gap-2">
          {invoice.status === "draft" && (
            <form action={markInvoiceSent.bind(null, invoice.id)}>
              <button className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
                Mark as sent
              </button>
            </form>
          )}
          {invoice.status === "sent" && (
            <form action={markInvoicePaid.bind(null, invoice.id)}>
              <button className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-600">
                Mark as paid
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="grid gap-6 rounded-lg border border-gray-200 bg-white p-6 sm:grid-cols-2">
        <div className="text-sm">
          <p className="text-gray-500">From</p>
          <p className="mt-1 font-medium">{account.name}</p>
          <p className="whitespace-pre-line text-gray-600">{account.address}</p>
          <p className="text-gray-600">{account.email}</p>
        </div>
        <div className="text-sm">
          <p className="text-gray-500">Bill to</p>
          <p className="mt-1 font-medium">{invoice.client.company ?? invoice.client.name}</p>
          <p className="text-gray-600">{invoice.client.name}</p>
          <p className="text-gray-600">{invoice.client.email}</p>
        </div>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2 font-medium">Description</th>
              <th className="px-4 py-2 text-right font-medium">Qty</th>
              <th className="px-4 py-2 text-right font-medium">Unit price</th>
              <th className="px-4 py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">{item.description}</td>
                <td className="px-4 py-3 text-right tabular-nums">{item.quantity}</td>
                <td className="px-4 py-3 text-right tabular-nums">{money(item.unitPriceCents)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{money(item.quantity * item.unitPriceCents)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-200">
              <td colSpan={3} className="px-4 py-3 text-right font-medium">Total</td>
              <td className="px-4 py-3 text-right text-base font-semibold tabular-nums">
                {money(invoiceTotal(invoice.items))}
              </td>
            </tr>
          </tfoot>
        </table>
      </section>

      {invoice.notes && (
        <p className="whitespace-pre-line rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
          {invoice.notes}
        </p>
      )}
    </div>
  );
}
