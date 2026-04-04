// components/buyer/buyer-dashboard.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, CheckCircle, Clock, DollarSign, Plus } from "lucide-react";
import Link from "next/link";
import { ActiveContracts } from "./active-contracts";
import { RecentProjects } from "./recent-projects";
import { RecommendedContractors } from "./recommended-contractors";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function BuyerDashboard() {
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
    redirect("/");
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
    .eq("buyer_id", buyer!?.id);

  const stats = {
    totalProjects: projects?.length || 0,
    activeProjects: projects?.filter((p) => p.status === "active").length || 0,
    completedProjects:
      projects?.filter((p) => p.status === "completed").length || 0,
    totalBudget: projects?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Projects
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeProjects} active, {stats.completedProjects} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Projects
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed Projects
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Investment
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalBudget)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all projects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          <TabsTrigger value="contracts">Active Contracts</TabsTrigger>
          <TabsTrigger value="recommended">Recommended Contractors</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Recent Projects</h2>
            <Link href="/dashboard/projects/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </Link>
          </div>
          <RecentProjects />
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4">
          <h2 className="text-xl font-semibold">Active Contracts</h2>
          <ActiveContracts />
        </TabsContent>

        <TabsContent value="recommended" className="space-y-4">
          <h2 className="text-xl font-semibold">Recommended Contractors</h2>
          <RecommendedContractors />
        </TabsContent>
      </Tabs>
    </div>
  );
}
