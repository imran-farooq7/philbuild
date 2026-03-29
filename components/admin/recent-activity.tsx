// components/admin/recent-activity.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  UserPlus,
  Briefcase,
  CheckCircle,
  Star,
  AlertCircle,
} from "lucide-react";

type Activity = {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: any;
  created_at: string;
  user: {
    full_name: string;
    avatar_url: string | null;
    user_type: string;
  };
};

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/admin/activities");
      const data = await response.json();
      setActivities(data.slice(0, 10)); // Get last 10 activities
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "user_register":
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case "project_create":
        return <Briefcase className="h-4 w-4 text-blue-500" />;
      case "project_complete":
        return <CheckCircle className="h-4 w-4 text-purple-500" />;
      case "review_submit":
        return <Star className="h-4 w-4 text-yellow-500" />;
      case "contractor_verify":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.action) {
      case "user_register":
        return `${activity.user.full_name} registered as a ${activity.metadata.user_type}`;
      case "project_create":
        return `${activity.user.full_name} created project "${activity.metadata.project_title}"`;
      case "project_complete":
        return `Project "${activity.metadata.project_title}" was marked as completed`;
      case "review_submit":
        return `${activity.user.full_name} left a ${activity.metadata.rating}-star review`;
      case "contractor_verify":
        return `${activity.metadata.contractor_name} was verified as a contractor`;
      default:
        return `${activity.user.full_name} performed ${activity.action}`;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest platform activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading activities...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest platform activities</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activity.user.avatar_url || undefined} />
                  <AvatarFallback>
                    {activity.user.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    {getActivityIcon(activity.action)}
                    <p className="text-sm">{getActivityText(activity)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {activity.entity_type}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
