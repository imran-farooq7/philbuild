// app/(dashboard)/buyer/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BuyerDashboard } from "@/components/buyer/buyer-dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Suspense } from "react";
import Loading from "../admin/loading";

export default async function BuyerDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single();

  if (profile?.user_type !== "buyer") {
    redirect("/dashboard");
  }

  // Get buyer profile
  const { data: buyer } = await supabase
    .from("buyers")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Get projects stats
  const { data: projects } = await supabase
    .from("projects")
    .select("status, budget, completion_percentage")
    .eq("buyer_id", buyer?.id);

  const stats = {
    totalProjects: projects?.length || 0,
    activeProjects: projects?.filter((p) => p.status === "active").length || 0,
    completedProjects:
      projects?.filter((p) => p.status === "completed").length || 0,
    totalBudget: projects?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0,
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Buyer Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your construction projects and contractor relationships
        </p>
      </div>

      <Suspense fallback={<Loading />}>
        <BuyerDashboard stats={stats} />
      </Suspense>
    </div>
  );
}
