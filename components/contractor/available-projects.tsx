// components/contractor/available-projects.tsx
"use client";

import { submitBid } from "@/actions/project";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format, formatDistanceToNow } from "date-fns";
import {
  Calendar,
  Clock,
  DollarSign,
  Filter,
  MapPin,
  Search,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Project = {
  id: string;
  title: string;
  description: string;
  budget: number;
  address: string;
  start_date: string;
  end_date: string;
  created_at: string;
  buyer: {
    company_name: string;
    profile: {
      full_name: string;
    };
  };
  project_scope: Array<{ description: string }>;
};

export function AvailableProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [timeline, setTimeline] = useState("");
  const [proposal, setProposal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");

  useEffect(() => {
    fetchAvailableProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [searchTerm, minBudget, maxBudget, projects]);

  const fetchAvailableProjects = async () => {
    try {
      const response = await fetch("/api/contractor/available-projects");
      const data = await response.json();
      setProjects(data);
      setFilteredProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];

    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (minBudget) {
      filtered = filtered.filter(
        (project) => project.budget >= parseInt(minBudget),
      );
    }

    if (maxBudget) {
      filtered = filtered.filter(
        (project) => project.budget <= parseInt(maxBudget),
      );
    }

    setFilteredProjects(filtered);
  };

  const handleSubmitBid = async () => {
    if (!selectedProject) return;

    setIsSubmitting(true);
    try {
      await submitBid(
        selectedProject.id,
        parseFloat(bidAmount),
        proposal,
        parseInt(timeline),
      );
      toast.success("Your bid has been submitted successfully");
      setSelectedProject(null);
      setBidAmount("");
      setTimeline("");
      setProposal("");
      fetchAvailableProjects();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to submit bid");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

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

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Min Budget"
                value={minBudget}
                onChange={(e) => setMinBudget(e.target.value)}
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Max Budget"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setMinBudget("");
                setMaxBudget("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-semibold">No projects found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or check back later for new projects
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{project.title}</CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700"
                  >
                    Open for Bids
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
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
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm">{project.address}</p>
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
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Posted</p>
                      <p className="text-sm">
                        {formatDistanceToNow(new Date(project.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scope Preview */}
                {project.project_scope && project.project_scope.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.project_scope.slice(0, 3).map((scope, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {scope.description}
                      </Badge>
                    ))}
                    {project.project_scope.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{project.project_scope.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>

              <CardFooter>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full"
                      onClick={() => setSelectedProject(project)}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Submit Bid
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        Submit Bid for {selectedProject?.title}
                      </DialogTitle>
                      <DialogDescription>
                        Provide your proposal and pricing for this project
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Bid Amount (₱) *</Label>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Estimated Timeline (days) *</Label>
                          <Input
                            type="number"
                            placeholder="Number of days"
                            value={timeline}
                            onChange={(e) => setTimeline(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Proposal *</Label>
                        <Textarea
                          placeholder="Describe your approach, methodology, and why you're the best fit..."
                          value={proposal}
                          onChange={(e) => setProposal(e.target.value)}
                          rows={5}
                        />
                      </div>

                      {selectedProject && (
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm font-medium mb-1">
                            Project Budget Range:
                          </p>
                          <p className="text-sm">
                            {formatCurrency(selectedProject.budget)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Tip: Competitive bids within 10-20% of the project
                            budget have higher acceptance rates
                          </p>
                        </div>
                      )}
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedProject(null)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSubmitBid} disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit Bid"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
