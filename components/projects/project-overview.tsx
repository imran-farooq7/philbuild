// components/projects/project-overview.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { publishProject } from "@/actions/project";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ProjectOverviewProps = {
  project: any;
  userRole: string;
};

export function ProjectOverview({ project, userRole }: ProjectOverviewProps) {
  const router = useRouter();

  const handlePublish = async () => {
    try {
      await publishProject(project.id);
      toast("Your project is now open for contractor bids");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to publish project",
      );
    }
  };

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

  const getDaysRemaining = () => {
    const endDate = new Date(project.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Project Status Banner */}
      {project.status === "draft" && userRole === "buyer" && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800">
                    Project Draft
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    This project is still in draft mode. Publish it to make it
                    visible to contractors.
                  </p>
                </div>
              </div>
              <Button onClick={handlePublish}>Publish Project</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Budget</span>
            </div>
            <p className="text-2xl font-bold">
              {formatCurrency(project.budget)}
            </p>
            {project.current_cost > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                Spent: {formatCurrency(project.current_cost)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Timeline</span>
            </div>
            <p className="text-lg font-semibold">
              {format(new Date(project.start_date), "MMM dd")} -{" "}
              {format(new Date(project.end_date), "MMM dd, yyyy")}
            </p>
            {project.status === "active" && (
              <p className="text-sm text-muted-foreground mt-1">
                {getDaysRemaining()} days remaining
              </p>
            )}
          </CardContent>
        </Card>

        {project.status === "active" && (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">Completion</span>
                </div>
                <p className="text-2xl font-bold">
                  {project.completion_percentage}%
                </p>
                <Progress
                  value={project.completion_percentage}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Status</span>
                </div>
                <Badge className={getStatusColor(project.status)}>
                  {project.status.toUpperCase()}
                </Badge>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Project Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{project.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Scope</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {project.project_scope?.map((scope: any, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>{scope.description}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {project.project_requirements?.map(
                  (req: any, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <span>{req.requirement}</span>
                    </li>
                  ),
                )}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p>{project.address}</p>
              </div>
            </CardContent>
          </Card>

          {userRole === "buyer" && project.contractors && (
            <Card>
              <CardHeader>
                <CardTitle>Contractor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">
                      {project.contractors.company_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {project.contractors.profiles?.full_name}
                    </p>
                    {project.contractors.tier && (
                      <Badge variant="outline" className="mt-2">
                        {project.contractors.tier.toUpperCase()} Tier Contractor
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {userRole === "contractor" && project.buyers && (
            <Card>
              <CardHeader>
                <CardTitle>Client</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">
                      {project.buyers.profiles?.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {project.buyers.profiles?.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
