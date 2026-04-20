// app/(dashboard)/contractor/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ContractorDashboard } from "@/components/contractor/contractor-dashboard";
import { Suspense } from "react";

export default async function ContractorDashboardPage() {
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

  if (profile?.user_type !== "contractor") {
    redirect("/dashboard");
  }

  // Get contractor profile
  const { data: contractor } = await supabase
    .from("contractors")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Get projects stats
  const { data: projects } = await supabase
    .from("projects")
    .select("status, budget, completion_percentage")
    .eq("contractor_id", contractor?.id!);

  // Get bids stats
  const { data: bids } = await supabase
    .from("bids")
    .select("status, amount")
    .eq("contractor_id", contractor?.id!);

  const stats = {
    totalProjects: projects?.length || 0,
    activeProjects: projects?.filter((p) => p.status === "active").length || 0,
    completedProjects:
      projects?.filter((p) => p.status === "completed").length || 0,
    pendingBids: bids?.filter((b) => b.status === "pending").length || 0,
    acceptedBids: bids?.filter((b) => b.status === "accepted").length || 0,
    totalEarnings: projects?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0,
    averageRating: contractor?.average_rating || 0,
    verificationScore: contractor?.verification_score || 0,
    tier: contractor?.tier || "pending",
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Contractor Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your projects, bids, and company profile
        </p>
      </div>

      <Suspense fallback={<div>Loading dashboard...</div>}>
        <ContractorDashboard stats={stats} contractor={contractor} />
      </Suspense>
    </div>
  );
}
