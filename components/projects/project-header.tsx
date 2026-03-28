// components/projects/project-header.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ArrowLeft, Download, Edit, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";

type ProjectHeaderProps = {
  project: any;
  userRole: string;
};

export function ProjectHeader({ project, userRole }: ProjectHeaderProps) {
  const router = useRouter();

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

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM dd, yyyy");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    // Toast notification would go here
  };

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="mb-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Projects
      </Button>

      {/* Main Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className={getStatusColor(project.status)}>
              {project.status.toUpperCase()}
            </Badge>
            {project.published_at && (
              <span className="text-xs text-muted-foreground">
                Published on {formatDate(project.published_at)}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold">{project.title}</h1>
          <p className="text-muted-foreground mt-2">
            Project ID: {project.id.slice(0, 8)}...
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          {userRole === "buyer" && project.status === "draft" && (
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Project Timeline Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p className="font-semibold">{formatDate(project.start_date)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">End Date</p>
              <p className="font-semibold">{formatDate(project.end_date)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-semibold">
                {Math.ceil(
                  (new Date(project.end_date).getTime() -
                    new Date(project.start_date).getTime()) /
                    (1000 * 60 * 60 * 24),
                )}{" "}
                days
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
