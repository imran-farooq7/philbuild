// app/(dashboard)/admin/page.tsx
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { redirect } from "next/navigation";
import { getPlatformAnalytics } from "@/actions/analytics";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import Loading from "./loading";

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage platform users, verify contractors, and monitor platform
          activity
        </p>
      </div>

      <Suspense fallback={<Loading />}>
        <AdminDashboardContent />
      </Suspense>
    </div>
  );
}

async function AdminDashboardContent() {
  const supabase = await createClient();

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
  console.log(profile);
  if (profile?.user_type !== "admin") {
    redirect("/dashboard");
  }

  const analytics = await getPlatformAnalytics(30);

  return <AdminDashboard analytics={analytics} />;
}
