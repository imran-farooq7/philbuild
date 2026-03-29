// components/admin/project-management.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Eye,
  MoreVertical,
  Trash2,
  Flag,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

type Project = {
  id: string;
  title: string;
  description: string;
  status: string;
  budget: number;
  completion_percentage: number;
  start_date: string;
  end_date: string;
  created_at: string;
  buyer: {
    company_name: string;
    profile: {
      full_name: string;
      email: string;
    };
  };
  contractor: {
    company_name: string;
  } | null;
};

export function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminNote, setAdminNote] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/admin/projects");
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (projectId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/admin/projects/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, status: newStatus, note: adminNote }),
      });

      if (response.ok) {
        toast.success(`Project status changed to ${newStatus}`);
        fetchProjects();
        setSelectedProject(null);
        setAdminNote("");
      }
    } catch (error) {
      toast.error("Failed to update project status");
    }
  };

  const handleFlagProject = async (projectId: string) => {
    try {
      const response = await fetch("/api/admin/projects/flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, note: adminNote }),
      });

      if (response.ok) {
        toast.success("Project has been flagged for review");
        setSelectedProject(null);
      }
    } catch (error) {
      toast.error("Failed to flag project");
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.buyer.profile.full_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Management</CardTitle>
        <CardDescription>
          Monitor and manage all platform projects
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects by title or client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Projects Table */}
        {isLoading ? (
          <div className="text-center py-8">Loading projects...</div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Contractor</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{project.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {project.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {project.buyer.profile.full_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {project.buyer.company_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {project.contractor ? (
                        <div className="text-sm">
                          {project.contractor.company_name}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Not assigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{formatCurrency(project.budget)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(new Date(project.created_at), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedProject(project)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Project Details Dialog */}
        <Dialog
          open={!!selectedProject}
          onOpenChange={() => setSelectedProject(null)}
        >
          <DialogContent className="max-w-3xl">
            {selectedProject && (
              <>
                <DialogHeader>
                  <DialogTitle>Project Details</DialogTitle>
                  <DialogDescription>
                    Review and manage project information
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">
                      {selectedProject.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedProject.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Client</Label>
                      <p className="mt-1">
                        {selectedProject.buyer.profile.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedProject.buyer.company_name}
                      </p>
                      <p className="text-sm">
                        {selectedProject.buyer.profile.email}
                      </p>
                    </div>
                    <div>
                      <Label>Contractor</Label>
                      {selectedProject.contractor ? (
                        <>
                          <p className="mt-1">
                            {selectedProject.contractor.company_name}
                          </p>
                        </>
                      ) : (
                        <p className="text-muted-foreground mt-1">
                          No contractor assigned
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>Budget</Label>
                      <p className="mt-1 font-medium">
                        {formatCurrency(selectedProject.budget)}
                      </p>
                    </div>
                    <div>
                      <Label>Timeline</Label>
                      <p className="mt-1">
                        {new Date(
                          selectedProject.start_date,
                        ).toLocaleDateString()}{" "}
                        -{" "}
                        {new Date(
                          selectedProject.end_date,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Badge
                        className={`mt-1 ${getStatusColor(selectedProject.status)}`}
                      >
                        {selectedProject.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <Label>Completion</Label>
                      <p className="mt-1">
                        {selectedProject.completion_percentage}%
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Admin Note</Label>
                    <Textarea
                      placeholder="Add notes about this project..."
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Select
                    onValueChange={(value) =>
                      handleUpdateStatus(selectedProject.id, value)
                    }
                  >
                    <SelectTrigger className="w-45">
                      <SelectValue placeholder="Change status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Set Active</SelectItem>
                      <SelectItem value="pending">Set Pending</SelectItem>
                      <SelectItem value="completed">Set Completed</SelectItem>
                      <SelectItem value="cancelled">Set Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="destructive"
                    onClick={() => handleFlagProject(selectedProject.id)}
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Flag Project
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedProject(null)}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
