// app/(dashboard)/projects/page.tsx
import { ProjectList } from "@/components/projects/project-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Project } from "@/components/projects/project-card";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { ProjectsPageFallback } from "@/components/projects/ProjectsPageFallback";
export default function ProjectsPage() {
  return (
    <div className="container mx-auto py-10">
      <Suspense fallback={<ProjectsPageFallback />}>
        <ProjectsContent />
      </Suspense>
    </div>
  );
}

async function ProjectsContent() {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get user profile
  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("user_type")
    .eq("id", user!?.id)
    .single();

  // Fetch projects based on user type
  let projects: Project[] = [];

  if (profile?.user_type === "buyer") {
    const { data: buyer } = await adminSupabase
      .from("buyers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (buyer) {
      const { data } = await adminSupabase
        .from("projects")
        .select(
          `
          *,
          contractors:contractor_id (
            company_name,
            tier,
            profiles!contractors_user_id_fkey (full_name)
          )
        `,
        )
        .eq("buyer_id", buyer.id)
        .order("created_at", { ascending: false });

      projects = data || [];
    }
  } else if (profile?.user_type === "contractor") {
    const { data: contractor } = await adminSupabase
      .from("contractors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (contractor) {
      const { data } = await adminSupabase
        .from("projects")
        .select(
          `
          *,
          buyers:buyer_id (
            profiles:user_id (full_name)
          )
        `,
        )
        .eq("contractor_id", contractor.id)
        .order("created_at", { ascending: false });

      projects = data || [];
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track all your construction projects
          </p>
        </div>

        {profile?.user_type === "buyer" && (
          <Link href="/dashboard/projects/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </Link>
        )}
      </div>

      <ProjectList
        projects={projects}
        userType={profile?.user_type || "buyer"}
      />
    </>
  );
}
