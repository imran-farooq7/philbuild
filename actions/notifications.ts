// app/actions/notifications.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type NotificationType =
  | "project_update"
  | "bid_update"
  | "inspection"
  | "message"
  | "system"
  | "review";

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  metadata: any = {},
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      type,
      title,
      message,
      metadata,
    })
    .select()
    .single();

  if (error) throw error;

  // Trigger real-time update (handled by Supabase realtime subscriptions)
  return data;
}

export async function getNotifications(
  userId: string,
  limit: number = 20,
  offset: number = 0,
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data;
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId);

  if (error) throw error;

  revalidatePath("/dashboard/notifications");
  return { success: true };
}

export async function markAllNotificationsAsRead(userId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) throw error;

  revalidatePath("/dashboard/notifications");
  return { success: true };
}

export async function getUnreadCount(userId: string) {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) throw error;
  return count || 0;
}

export async function deleteNotification(notificationId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId);

  if (error) throw error;

  revalidatePath("/dashboard/notifications");
  return { success: true };
}
