// app/(dashboard)/admin/page.tsx
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { Button } from "@/components/ui/button";
import { getPlatformAnalytics } from "@/actions/analytics";
import { createClient } from "@/lib/supabase/server";
import Loading from "./loading";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage platform users, verify contractors, and monitor platform
            activity
          </p>
        </div>
        <form action={logout}>
          <Button type="submit" variant="outline">
            Log out
          </Button>
        </form>
      </div>

      <Suspense fallback={<Loading />}>
        <AdminDashboardContent />
      </Suspense>
    </div>
  );
}

async function logout() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
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
  if (profile?.user_type !== "admin") {
    redirect("/");
  }

  const analytics = await getPlatformAnalytics(30);

  return <AdminDashboard analytics={analytics} />;
}
