// app/(dashboard)/notifications/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getNotifications } from "@/actions/notifications";
import { NotificationsList } from "@/components/notifications/notifications-list";
import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Loading from "../admin/loading";

async function NotificationsContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const notifications = await getNotifications(user.id);

  return <NotificationsList initialNotifications={notifications} />;
}

export default function NotificationsPage() {
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Stay updated on your projects and activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Loading />}>
            <NotificationsContent />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
