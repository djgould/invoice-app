import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
  integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`);

export const accounts = sqliteTable("accounts", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  address: text("address"),
  currency: text("currency").notNull().default("USD"),
  createdAt: createdAt(),
});

export const clients = sqliteTable("clients", {
  id: id(),
  accountId: text("account_id")
    .notNull()
    .references(() => accounts.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  createdAt: createdAt(),
});

export const invoices = sqliteTable("invoices", {
  id: id(),
  accountId: text("account_id")
    .notNull()
    .references(() => accounts.id),
  clientId: text("client_id")
    .notNull()
    .references(() => clients.id),
  number: text("number").notNull(),
  status: text("status", { enum: ["draft", "sent", "paid"] })
    .notNull()
    .default("draft"),
  issueDate: text("issue_date").notNull(),
  dueDate: text("due_date").notNull(),
  notes: text("notes"),
  paidAt: integer("paid_at", { mode: "timestamp" }),
  createdAt: createdAt(),
});

export const invoiceItems = sqliteTable("invoice_items", {
  id: id(),
  invoiceId: text("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPriceCents: integer("unit_price_cents").notNull(),
});

export const accountsRelations = relations(accounts, ({ many }) => ({
  clients: many(clients),
  invoices: many(invoices),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  account: one(accounts, {
    fields: [clients.accountId],
    references: [accounts.id],
  }),
  invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  account: one(accounts, {
    fields: [invoices.accountId],
    references: [accounts.id],
  }),
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
  }),
  items: many(invoiceItems),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
}));

export type Account = typeof accounts.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
