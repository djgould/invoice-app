import Link from "next/link";
import { InvoiceTable } from "@/components/invoice-table";
import { getCurrentAccount } from "@/lib/current-account";
import { dashboardStats } from "@/lib/invoices";
import { formatMoney } from "@/lib/money";

export default async function DashboardPage() {
  const account = await getCurrentAccount();
  const stats = await dashboardStats(account.id);

  const cards = [
    { label: "Outstanding", value: stats.outstanding },
    { label: "Overdue", value: stats.overdue },
    { label: "Paid in the last 30 days", value: stats.paidLast30Days },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Link href="/invoices/new" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
          New invoice
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {formatMoney(card.value, account.currency)}
            </p>
          </div>
        ))}
      </div>
      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="font-medium">Recent invoices</h2>
          <Link href="/invoices" className="text-sm text-gray-600 hover:text-gray-900">
            View all
          </Link>
        </div>
        <InvoiceTable invoices={stats.recent} currency={account.currency} />
      </section>
    </div>
  );
}
