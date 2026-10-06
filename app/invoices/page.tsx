import Link from "next/link";
import { InvoiceTable } from "@/components/invoice-table";
import { getCurrentAccount } from "@/lib/current-account";
import { listInvoices, type InvoiceStatus } from "@/lib/invoices";

const filters: { label: string; value?: InvoiceStatus }[] = [
  { label: "All" },
  { label: "Draft", value: "draft" },
  { label: "Sent", value: "sent" },
  { label: "Overdue", value: "overdue" },
  { label: "Paid", value: "paid" },
];

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = filters.find((f) => f.value === status)?.value;
  const account = await getCurrentAccount();
  const invoices = await listInvoices(account.id, active);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <Link href="/invoices/new" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
          New invoice
        </Link>
      </div>
      <div className="flex gap-2 text-sm">
        {filters.map((filter) => (
          <Link
            key={filter.label}
            href={filter.value ? `/invoices?status=${filter.value}` : "/invoices"}
            className={`rounded-full px-3 py-1 ${
              filter.value === active ? "bg-gray-900 text-white" : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100"
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>
      <section className="rounded-lg border border-gray-200 bg-white">
        <InvoiceTable invoices={invoices} currency={account.currency} />
      </section>
    </div>
  );
}
