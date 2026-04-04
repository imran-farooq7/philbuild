// components/buyer/recent-projects.tsx

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { Briefcase, Calendar, DollarSign, Eye, Plus, User } from "lucide-react";
import Link from "next/link";

type Project = {
  id: string;
  title: string;
  description: string;
  status: string;
  budget: number;
  current_cost: number;
  completion_percentage: number;
  start_date: string;
  end_date: string;
  contractor: {
    company_name: string;
    tier: string;
  } | null;
  created_at: string;
};

export async function RecentProjects() {
  const response = await fetch("/api/buyer/projects");
  const data = await response.json();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "completed":
        return "bg-blue-500";
      case "draft":
        return "bg-gray-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold">No projects yet</h3>
          <p className="text-muted-foreground">
            Create your first project to get started
          </p>
          <Link href="/dashboard/projects/create">
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((project: Project) => (
        <Card key={project.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{project.title}</CardTitle>
                <CardDescription className="mt-1 line-clamp-2">
                  {project.description}
                </CardDescription>
              </div>
              <Badge className={getStatusColor(project.status)}>
                {project.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Progress Bar */}
            {project.status === "active" && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completion Progress</span>
                  <span className="font-semibold">
                    {project.completion_percentage}%
                  </span>
                </div>
                <Progress
                  value={project.completion_percentage}
                  className="h-2"
                />
              </div>
            )}

            {/* Project Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Budget</p>
                  <p className="font-semibold">
                    {formatCurrency(project.budget)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Timeline</p>
                  <p className="text-sm">
                    {format(new Date(project.start_date), "MMM dd")} -{" "}
                    {format(new Date(project.end_date), "MMM dd")}
                  </p>
                </div>
              </div>

              {project.contractor && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Contractor</p>
                    <p className="text-sm font-medium">
                      {project.contractor.company_name}
                    </p>
                    {project.contractor.tier && (
                      <Badge variant="outline" className="text-xs mt-1">
                        {project.contractor.tier.toUpperCase()} Tier
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter>
            <Link href={`/dashboard/projects/${project.id}`} className="w-full">
              <Button variant="outline" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
