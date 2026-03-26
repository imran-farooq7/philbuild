// app/(dashboard)/projects/[id]/page.tsx
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProjectDetails } from "@/app/actions/project";
import { ProjectHeader } from "@/components/projects/project-header";
import { ProjectOverview } from "@/components/projects/project-overview";
import { ProjectBudget } from "@/components/projects/project-budget";
import { ProjectUpdates } from "@/components/projects/project-updates";
import { ProjectInspections } from "@/components/projects/project-inspections";
import { ProjectBids } from "@/components/projects/project-bids";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default async function ProjectDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const project = await getProjectDetails(params.id);

  if (!project) {
    notFound();
  }

  // Get user profile to determine role
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single();

  const userRole = profile?.user_type || "buyer";

  return (
    <div className="container mx-auto py-10">
      <ProjectHeader project={project} userRole={userRole} />

      <Tabs defaultValue="overview" className="mt-8">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="updates">Updates</TabsTrigger>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
          {userRole === "buyer" && project.status === "pending" && (
            <TabsTrigger value="bids">Bids</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Suspense fallback={<Skeleton className="h-100" />}>
            <ProjectOverview project={project} userRole={userRole} />
          </Suspense>
        </TabsContent>

        <TabsContent value="budget" className="mt-6">
          <Suspense fallback={<Skeleton className="h-100" />}>
            <ProjectBudget projectId={project.id} userRole={userRole} />
          </Suspense>
        </TabsContent>

        <TabsContent value="updates" className="mt-6">
          <Suspense fallback={<Skeleton className="h-100" />}>
            <ProjectUpdates projectId={project.id} userRole={userRole} />
          </Suspense>
        </TabsContent>

        <TabsContent value="inspections" className="mt-6">
          <Suspense fallback={<Skeleton className="h-100" />}>
            <ProjectInspections projectId={project.id} userRole={userRole} />
          </Suspense>
        </TabsContent>

        {userRole === "buyer" && project.status === "pending" && (
          <TabsContent value="bids" className="mt-6">
            <Suspense fallback={<Skeleton className="h-100" />}>
              <ProjectBids projectId={project.id} />
            </Suspense>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
