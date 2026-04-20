// components/contractor/contractor-dashboard.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Award,
  Briefcase,
  Clock,
  DollarSign,
  FileText,
  Star,
} from "lucide-react";
import { AvailableProjects } from "./available-projects";
import { ContractorEarnings } from "./contractor-earnings";
import { MyBids } from "./my-bids";
import { MyProjects } from "./my-projects";
import { UpcomingDeadlines } from "./upcoming-deadlines";

interface ContractorDashboardProps {
  stats: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    pendingBids: number;
    acceptedBids: number;
    totalEarnings: number;
    averageRating: number;
    verificationScore: number;
    tier: string;
  };
  contractor: any;
}

export function ContractorDashboard({
  stats,
  contractor,
}: ContractorDashboardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "platinum":
        return "bg-gradient-to-r from-gray-400 to-gray-600 text-white";
      case "gold":
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case "silver":
        return "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800";
      case "bronze":
        return "bg-gradient-to-r from-amber-600 to-amber-700 text-white";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Verification Status Banner */}
      {contractor?.verification_status === "pending" && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800">
                  Verification Pending
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Your contractor application is being reviewed. This process
                  typically takes 3-5 business days. Once verified, you'll be
                  able to bid on projects.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Projects
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeProjects} active, {stats.completedProjects} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Bids
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingBids}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.acceptedBids} bids accepted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalEarnings)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageRating.toFixed(1)} / 5.0
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From client reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Verification Score & Tier */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Verification Score
            </CardTitle>
            <CardDescription>
              Your credibility score determines your tier level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-2xl font-bold">
                  {stats.verificationScore}/100
                </span>
                {stats.tier && (
                  <Badge className={getTierColor(stats.tier)}>
                    {stats.tier.toUpperCase()} TIER
                  </Badge>
                )}
              </div>
              <Progress value={stats.verificationScore} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                {stats.verificationScore >= 80
                  ? "Excellent! You qualify for premium projects."
                  : stats.verificationScore >= 60
                    ? "Good! Complete more projects to increase your score."
                    : "Complete your profile and add certifications to improve your score."}
              </p>
            </div>
          </CardContent>
        </Card>

        <UpcomingDeadlines />
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          <TabsTrigger value="bids">My Bids</TabsTrigger>
          <TabsTrigger value="available">Available Projects</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <MyProjects />
        </TabsContent>

        <TabsContent value="bids" className="space-y-4">
          <MyBids />
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          <AvailableProjects />
        </TabsContent>

        <TabsContent value="earnings" className="space-y-4">
          <ContractorEarnings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
