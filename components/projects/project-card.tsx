// components/projects/project-card.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  DollarSign,
  Users,
  Clock,
  CheckCircle2,
  PlayCircle,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export type Project = {
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
  contractors?: {
    company_name: string;
    tier: string | null;
    profiles: {
      full_name: string | null;
    };
  } | null;
  buyers?: {
    profiles: {
      full_name: string | null;
    };
  };
};

export function ProjectCard({
  project,
  userType,
}: {
  project: Project;
  userType: string;
}) {
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
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <PlayCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4" />;
      case "draft":
        return <FileText className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{project.title}</CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {project.description}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(project.status!)}>
            <span className="flex items-center gap-1">
              {getStatusIcon(project.status!)}
              {project.status!.charAt(0).toUpperCase() +
                project.status!.slice(1)}
            </span>
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
            <Progress value={project.completion_percentage} className="h-2" />
          </div>
        )}

        {/* Project Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Budget</p>
              <p className="font-semibold">
                ₱{project.budget!.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Timeline</p>
              <p className="text-sm">
                {formatDate(project.start_date!)} -{" "}
                {formatDate(project.end_date!)}
              </p>
            </div>
          </div>

          {userType === "buyer" && project.contractors && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Contractor</p>
                <p className="text-sm font-medium">
                  {project.contractors.company_name}
                </p>
                {project.contractors.tier && (
                  <Badge variant="outline" className="text-xs mt-1">
                    {project.contractors.tier.toUpperCase()} Tier
                  </Badge>
                )}
              </div>
            </div>
          )}

          {userType === "contractor" && project.buyers && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Client</p>
                <p className="text-sm font-medium">
                  {project.buyers.profiles.full_name}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Link href={`/dashboard/projects/${project.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            {project.status === "draft"
              ? "Complete Project Details"
              : "View Project Details"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
