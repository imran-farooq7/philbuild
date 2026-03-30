// components/notifications/notifications-list.tsx
"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Check,
  X,
  Calendar,
  DollarSign,
  AlertCircle,
  MessageSquare,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  markNotificationAsRead,
  deleteNotification,
} from "@/actions/notifications";
import Link from "next/link";
import { toast } from "sonner";
import { Json } from "@/lib/types/database";

type Notification = {
  created_at: string | null;
  id: string;
  message: string;
  metadata: Json | null;
  read: boolean | null;
  title: string;
  type: string | null;
  user_id: string;
};

const getProjectIdFromMetadata = (metadata: Json | null) => {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  const rawProjectId = metadata.projectId;
  if (typeof rawProjectId === "string") {
    return rawProjectId;
  }
  if (typeof rawProjectId === "number") {
    return String(rawProjectId);
  }

  return null;
};

export function NotificationsList({
  initialNotifications,
}: {
  initialNotifications: Notification[];
}) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    setNotifications(notifications.filter((n) => n.id !== id));
    toast("Notification deleted", { duration: 2000 });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "project_update":
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case "bid_update":
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case "inspection":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "review":
        return <Star className="h-5 w-5 text-purple-500" />;
      case "message":
        return <MessageSquare className="h-5 w-5 text-indigo-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationLink = (notification: Notification) => {
    const projectId = getProjectIdFromMetadata(notification.metadata);
    switch (notification.type) {
      case "project_update":
        return projectId ? `/dashboard/projects/${projectId}` : "#";
      case "bid_update":
        return projectId ? `/dashboard/projects/${projectId}/bids` : "#";
      case "inspection":
        return projectId ? `/dashboard/projects/${projectId}/inspections` : "#";
      case "review":
        return `/dashboard/reviews`;
      default:
        return "#";
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No notifications</h3>
        <p className="text-muted-foreground">
          You're all caught up! New notifications will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 border rounded-lg transition-colors ${
            !notification.read
              ? "bg-muted/50 border-primary/20"
              : "bg-background"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="mt-1">
              {getNotificationIcon(notification.type!)}
            </div>
            <div className="flex-1">
              <Link href={getNotificationLink(notification)}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{notification.title}</h4>
                    {!notification.read && (
                      <Badge
                        variant="default"
                        className="bg-blue-500 text-white text-xs"
                      >
                        New
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.created_at!), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </Link>
            </div>
            <div className="flex gap-2">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMarkAsRead(notification.id)}
                  className="h-8 w-8 p-0"
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(notification.id)}
                className="h-8 w-8 p-0 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
