// components/projects/project-list.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectCard } from "./project-card";

type Project = {
  address: string | null;
  budget: number | null;
  buyer_id: string;
  completion_percentage: number | null;
  contractor_id: string | null;
  created_at: string | null;
  current_cost: number | null;
  description: string | null;
  end_date: string | null;
  id: string;
  start_date: string | null;
  status: string | null;
  title: string;
  updated_at: string | null;
  buyers?: {
    profiles: {
      full_name: string | null;
    };
  };
};

export function ProjectList({
  projects,
  userType,
}: {
  projects: Project[];
  userType: string;
}) {
  const activeProjects = projects.filter((p) => p.status === "active");
  const pendingProjects = projects.filter((p) => p.status === "pending");
  const completedProjects = projects.filter((p) => p.status === "completed");
  const draftProjects = projects.filter((p) => p.status === "draft");

  return (
    <Tabs defaultValue="all" className="space-y-4">
      <TabsList>
        <TabsTrigger value="all">All ({projects.length})</TabsTrigger>
        <TabsTrigger value="active">
          Active ({activeProjects.length})
        </TabsTrigger>
        <TabsTrigger value="pending">
          Pending ({pendingProjects.length})
        </TabsTrigger>
        <TabsTrigger value="completed">
          Completed ({completedProjects.length})
        </TabsTrigger>
        {userType === "buyer" && (
          <TabsTrigger value="draft">
            Draft ({draftProjects.length})
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="all" className="space-y-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} userType={userType} />
        ))}
        {projects.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No projects found</p>
            {userType === "buyer" && (
              <p className="text-sm mt-2">
                Create your first project to get started
              </p>
            )}
          </div>
        )}
      </TabsContent>

      <TabsContent value="active" className="space-y-4">
        {activeProjects.map((project) => (
          <ProjectCard key={project.id} project={project} userType={userType} />
        ))}
      </TabsContent>

      <TabsContent value="pending" className="space-y-4">
        {pendingProjects.map((project) => (
          <ProjectCard key={project.id} project={project} userType={userType} />
        ))}
      </TabsContent>

      <TabsContent value="completed" className="space-y-4">
        {completedProjects.map((project) => (
          <ProjectCard key={project.id} project={project} userType={userType} />
        ))}
      </TabsContent>

      {userType === "buyer" && (
        <TabsContent value="draft" className="space-y-4">
          {draftProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              userType={userType}
            />
          ))}
        </TabsContent>
      )}
    </Tabs>
  );
}
