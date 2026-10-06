import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "../db";
import { accounts, clients, invoiceItems, invoices } from "../db/schema";
import { DEMO_ACCOUNT_ID } from "../lib/current-account";
import { addDays, today } from "../lib/dates";

async function main() {
  await migrate(db, { migrationsFolder: "drizzle" });

  const existing = await db.query.accounts.findFirst();
  if (existing) {
    console.log("Database ready.");
    return;
  }

  await db.insert(accounts).values({
    id: DEMO_ACCOUNT_ID,
    name: "Acme Studio",
    email: "billing@acmestudio.example",
    address: "214 Mercer St, Suite 3\nBrooklyn, NY 11201",
    currency: "USD",
  });

  const [northwind, globex, initech] = await db
    .insert(clients)
    .values([
      { accountId: DEMO_ACCOUNT_ID, name: "Morgan Ellis", email: "morgan@northwind.example", company: "Northwind Traders" },
      { accountId: DEMO_ACCOUNT_ID, name: "Priya Shah", email: "ap@globex.example", company: "Globex" },
      { accountId: DEMO_ACCOUNT_ID, name: "Sam Okafor", email: "sam@initech.example", company: "Initech" },
    ])
    .returning();

  const t = today();
  const seed = [
    { client: northwind, number: "INV-0001", issued: -62, status: "paid", paidAfter: 12, items: [["Brand identity refresh", 1, 480000]] },
    { client: globex, number: "INV-0002", issued: -48, status: "paid", paidAfter: 20, items: [["Landing page design", 1, 220000], ["Copywriting", 6, 9500]] },
    { client: initech, number: "INV-0003", issued: -41, status: "sent", items: [["Product photography (half day)", 1, 140000]] },
    { client: northwind, number: "INV-0004", issued: -20, status: "paid", paidAfter: 9, items: [["Packaging design", 1, 310000]] },
    { client: globex, number: "INV-0005", issued: -10, status: "sent", items: [["Monthly retainer, design", 1, 450000]] },
    { client: initech, number: "INV-0006", issued: -3, status: "sent", items: [["Pitch deck", 1, 180000], ["Revisions", 4, 12000]] },
    { client: northwind, number: "INV-0007", issued: 0, status: "draft", items: [["Trade show booth graphics", 1, 260000]] },
  ] as const;

  for (const entry of seed) {
    const issueDate = addDays(t, entry.issued);
    const [invoice] = await db
      .insert(invoices)
      .values({
        accountId: DEMO_ACCOUNT_ID,
        clientId: entry.client.id,
        number: entry.number,
        status: entry.status,
        issueDate,
        dueDate: addDays(issueDate, 30),
        paidAt:
          "paidAfter" in entry
            ? new Date(`${addDays(issueDate, entry.paidAfter)}T12:00:00Z`)
            : null,
      })
      .returning();
    await db.insert(invoiceItems).values(
      entry.items.map(([description, quantity, unitPriceCents]) => ({
        invoiceId: invoice.id,
        description,
        quantity,
        unitPriceCents,
      })),
    );
  }

  console.log("Database ready. Seeded the Acme Studio demo account.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
