// components/notifications/notifications-dropdown.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  X,
  AlertCircle,
  MessageSquare,
  Star,
  Calendar,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/actions/notifications";
import Link from "next/link";
import { toast } from "sonner";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  metadata: any;
  read: boolean;
  created_at: string;
};

export function NotificationsDropdown({
  initialNotifications,
}: {
  initialNotifications: Notification[];
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead(notifications[0]?.id || "");
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    toast("All notifications marked as read", { duration: 2000 });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "project_update":
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case "bid_update":
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case "inspection":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "review":
        return <Star className="h-4 w-4 text-purple-500" />;
      case "message":
        return <MessageSquare className="h-4 w-4 text-indigo-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationLink = (notification: Notification) => {
    switch (notification.type) {
      case "project_update":
        return `/dashboard/projects/${notification.metadata.projectId}`;
      case "bid_update":
        return `/dashboard/projects/${notification.metadata.projectId}/bids`;
      case "inspection":
        return `/dashboard/projects/${notification.metadata.projectId}/inspections`;
      case "review":
        return `/dashboard/reviews`;
      default:
        return "#";
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-100">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 cursor-pointer ${!notification.read ? "bg-muted/50" : ""}`}
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <Link
                  href={getNotificationLink(notification)}
                  className="flex items-start gap-3 w-full"
                >
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                  )}
                </Link>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
