// components/contractor/my-projects.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  AlertCircle,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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
  buyer: {
    company_name: string;
    profile: {
      full_name: string;
      avatar_url: string | null;
    };
  };
  created_at: string;
};

export function MyProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/contractor/projects");
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
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
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Clock className="h-3 w-3" />;
      case "completed":
        return <CheckCircle className="h-3 w-3" />;
      case "cancelled":
        return <AlertCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const filteredProjects = projects.filter((project) => {
    if (filter === "all") return true;
    return project.status === filter;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold">No projects yet</h3>
          <p className="text-muted-foreground">
            Once you win bids, your projects will appear here
          </p>
          <Link href="/dashboard/contractor/browse">
            <Button className="mt-4">Browse Available Projects</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All ({projects.length})
        </Button>
        <Button
          variant={filter === "active" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("active")}
        >
          Active ({projects.filter((p) => p.status === "active").length})
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("completed")}
        >
          Completed ({projects.filter((p) => p.status === "completed").length})
        </Button>
      </div>

      {filteredProjects.map((project) => (
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
                <span className="flex items-center gap-1">
                  {getStatusIcon(project.status)}
                  {project.status.toUpperCase()}
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
                <Progress
                  value={project.completion_percentage}
                  className="h-2"
                />
              </div>
            )}

            {/* Project Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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

              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={project.buyer.profile.avatar_url || undefined}
                  />
                  <AvatarFallback>
                    {project.buyer.company_name?.charAt(0) || "C"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs text-muted-foreground">Client</p>
                  <p className="text-sm font-medium">
                    {project.buyer.company_name}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex gap-2">
            <Link href={`/dashboard/projects/${project.id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </Link>
            <Button variant="default" className="flex-1">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message Client
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
