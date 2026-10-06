"use client";

import { useState } from "react";
import type { Client } from "@/db/schema";

type Row = { description: string; quantity: string; price: string };

const emptyRow: Row = { description: "", quantity: "1", price: "" };

export function InvoiceForm({
  clients,
  number,
  issueDate,
  dueDate,
  action,
}: {
  clients: Client[];
  number: string;
  issueDate: string;
  dueDate: string;
  action: (formData: FormData) => Promise<void>;
}) {
  const [rows, setRows] = useState<Row[]>([{ ...emptyRow }]);

  const update = (index: number, patch: Partial<Row>) =>
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const total = rows.reduce(
    (sum, row) => sum + (Number(row.quantity) || 0) * (Number(row.price) || 0),
    0,
  );

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="items" value={JSON.stringify(rows)} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-gray-700">Client</span>
          <select name="clientId" required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2">
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.company ?? client.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-gray-700">Invoice number</span>
          <input name="number" defaultValue={number} required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="text-gray-700">Issue date</span>
          <input type="date" name="issueDate" defaultValue={issueDate} required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="text-gray-700">Due date</span>
          <input type="date" name="dueDate" defaultValue={dueDate} required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
        </label>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-[1fr_6rem_8rem_2rem] gap-2 text-xs font-medium text-gray-500">
          <span>Description</span>
          <span>Qty</span>
          <span>Unit price</span>
          <span />
        </div>
        {rows.map((row, index) => (
          <div key={index} className="grid grid-cols-[1fr_6rem_8rem_2rem] gap-2">
            <input
              value={row.description}
              onChange={(e) => update(index, { description: e.target.value })}
              placeholder="What you did"
              required
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              value={row.quantity}
              onChange={(e) => update(index, { quantity: e.target.value })}
              inputMode="numeric"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              value={row.price}
              onChange={(e) => update(index, { price: e.target.value })}
              inputMode="decimal"
              placeholder="0.00"
              required
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
              disabled={rows.length === 1}
              className="text-gray-400 hover:text-gray-700 disabled:opacity-30"
              aria-label="Remove line"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setRows((current) => [...current, { ...emptyRow }])}
          className="text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          + Add line
        </button>
      </div>

      <label className="block text-sm">
        <span className="text-gray-700">Notes</span>
        <textarea name="notes" rows={3} placeholder="Payment terms, bank details, thank-you note…" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
      </label>

      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <p className="text-sm text-gray-600">
          Total <span className="ml-2 text-lg font-semibold text-gray-900 tabular-nums">{total.toFixed(2)}</span>
        </p>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
          Save draft
        </button>
      </div>
    </form>
  );
}
