"use server";

import { createClient } from "@/lib/supabase/server";
import type { ChartPoint } from "@/types/dashboard";
import { unwrap } from "./service-error";

type InvoiceRow = {
  id: string;
  total_amount: number | null;
  status: string | null;
  issued_at: string | null;
  created_at: string;
};

type PaymentRow = {
  amount: number | null;
  paid_at: string | null;
  created_at: string;
};

function monthLabel(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short" }).format(new Date(value));
}

function bucketMonthly(rows: Array<{ date: string; amount: number }>): ChartPoint[] {
  const buckets = new Map<string, number>();
  rows.forEach((row) => buckets.set(monthLabel(row.date), (buckets.get(monthLabel(row.date)) ?? 0) + row.amount));
  return Array.from(buckets.entries()).map(([label, value]) => ({ label, value }));
}

export async function getRevenueAnalytics(organizationId: string) {
  const supabase = await createClient();
  const [invoices, payments] = await Promise.all([
    supabase.from("invoices").select("id,total_amount,status,issued_at,created_at").eq("organization_id", organizationId).is("deleted_at", null),
    supabase.from("payments").select("amount,paid_at,created_at").eq("organization_id", organizationId).is("deleted_at", null),
  ]);
  const invoiceRows = unwrap(invoices.data, invoices.error) as unknown as InvoiceRow[];
  const paymentRows = unwrap(payments.data, payments.error) as unknown as PaymentRow[];
  const revenue = paymentRows.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
  const outstanding = invoiceRows.filter((invoice) => invoice.status !== "paid").reduce((sum, invoice) => sum + Number(invoice.total_amount ?? 0), 0);
  const trend = bucketMonthly(paymentRows.map((payment) => ({ date: payment.paid_at ?? payment.created_at, amount: Number(payment.amount ?? 0) })));
  const invoicesStatus = Array.from(invoiceRows.reduce((map, invoice) => map.set(invoice.status ?? "draft", (map.get(invoice.status ?? "draft") ?? 0) + 1), new Map<string, number>())).map(([label, value]) => ({ label, value }));
  return { revenue, outstanding, trend, invoicesStatus };
}
