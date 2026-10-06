import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/dates";
import { displayStatus, invoiceTotal, type InvoiceWithDetails } from "@/lib/invoices";
import { formatMoney } from "@/lib/money";

export function InvoiceTable({
  invoices,
  currency,
}: {
  invoices: InvoiceWithDetails[];
  currency: string;
}) {
  if (invoices.length === 0) {
    return <p className="px-4 py-10 text-center text-sm text-gray-500">No invoices yet.</p>;
  }
  return (
    <table className="w-full text-sm">
      <thead className="border-b border-gray-200 text-left text-gray-500">
        <tr>
          <th className="px-4 py-2 font-medium">Invoice</th>
          <th className="px-4 py-2 font-medium">Client</th>
          <th className="px-4 py-2 font-medium">Due</th>
          <th className="px-4 py-2 font-medium">Status</th>
          <th className="px-4 py-2 text-right font-medium">Amount</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {invoices.map((invoice) => (
          <tr key={invoice.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 font-medium">
              <Link href={`/invoices/${invoice.id}`} className="hover:underline">
                {invoice.number}
              </Link>
            </td>
            <td className="px-4 py-3">{invoice.client.company ?? invoice.client.name}</td>
            <td className="px-4 py-3 text-gray-600">{formatDate(invoice.dueDate)}</td>
            <td className="px-4 py-3">
              <StatusBadge status={displayStatus(invoice)} />
            </td>
            <td className="px-4 py-3 text-right tabular-nums">
              {formatMoney(invoiceTotal(invoice.items), currency)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
