"use server";

import { revalidatePath } from "next/cache";
import { requireActiveOrganization } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/authorization";
import { enforceSameOrigin } from "@/lib/security/request";
import { markAllNotificationsRead, markNotificationRead } from "@/services/notification.service";
import { completeTask } from "@/services/task.service";

export async function quickCompleteTaskAction(formData: FormData): Promise<void> {
  await enforceSameOrigin();
  const { activeOrganization } = await requireActiveOrganization("/dashboard");
  await requirePermission(activeOrganization.id, "tasks.update");
  const taskId = String(formData.get("taskId") ?? "");
  await completeTask(taskId);
  revalidatePath("/dashboard");
}

export async function markNotificationReadAction(formData: FormData): Promise<void> {
  await enforceSameOrigin();
  const notificationId = String(formData.get("notificationId") ?? "");
  await markNotificationRead(notificationId);
  revalidatePath("/dashboard");
}

export async function markAllNotificationsReadAction(): Promise<void> {
  await enforceSameOrigin();
  const { activeOrganization } = await requireActiveOrganization("/dashboard");
  await markAllNotificationsRead(activeOrganization.id);
  revalidatePath("/dashboard");
}
