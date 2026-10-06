import { getCurrentAccount } from "@/lib/current-account";
import { updateAccount } from "./actions";

const currencies = ["USD", "EUR", "GBP", "CAD", "AUD"];

export default async function SettingsPage() {
  const account = await getCurrentAccount();

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <form action={updateAccount} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="font-medium">Business profile</h2>
        <p className="text-sm text-gray-500">Shown in the “From” section of every invoice.</p>
        <label className="block text-sm">
          <span className="text-gray-700">Business name</span>
          <input name="name" defaultValue={account.name} required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="text-gray-700">Billing email</span>
          <input name="email" type="email" defaultValue={account.email} required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="text-gray-700">Address</span>
          <textarea name="address" rows={3} defaultValue={account.address ?? ""} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="text-gray-700">Currency</span>
          <select name="currency" defaultValue={account.currency} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2">
            {currencies.map((currency) => (
              <option key={currency}>{currency}</option>
            ))}
          </select>
        </label>
        <button className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
          Save changes
        </button>
      </form>
    </div>
  );
}
