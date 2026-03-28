// app/(dashboard)/admin/page.tsx
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
// import { getPlatformAnalytics } from '@/app/actions/analytics' should be added back when analytics are implemented
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Suspense } from "react";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single();

  if (profile?.user_type !== "admin") {
    redirect("/dashboard");
  }

  //   const analytics = await getPlatformAnalytics(30) should be added back when analytics are implemented

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage platform users, verify contractors, and monitor platform
          activity
        </p>
      </div>

      <Suspense fallback={<div>Loading dashboard...</div>}>
        <AdminDashboard />
      </Suspense>
    </div>
  );
}
