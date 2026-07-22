"use server";

import { createClient } from "@/lib/supabase/server";
import type { DashboardNotification } from "@/types/dashboard";
import { unwrap } from "./service-error";

type NotificationRow = {
  id: string;
  title: string;
  body: string | null;
  type: string;
  read_at: string | null;
  created_at: string;
};

export async function getNotifications(organizationId: string): Promise<DashboardNotification[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("id,title,body,type,read_at,created_at")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(20);
  return (unwrap(data, error) as unknown as NotificationRow[]).map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    type: row.type,
    readAt: row.read_at,
    createdAt: row.created_at,
  }));
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", notificationId);
  if (error) throw error;
}

export async function markAllNotificationsRead(organizationId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("organization_id", organizationId).is("read_at", null);
  if (error) throw error;
}
