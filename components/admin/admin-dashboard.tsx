// components/admin/admin-dashboard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, DollarSign, Star, Users } from "lucide-react";
import { PlatformMetrics } from "./platform-metrics";
import { RecentActivity } from "./recent-activity";
import { ReportsExport } from "./reports-export";
import { SystemSettings } from "./system-settings";
import { UserManagement } from "./user-management";
import { ContractorManagement } from "./contractor-management";
import { ProjectManagement } from "./project-management";

type AnalyticsData = {
  overview: {
    totalUsers: number;
    totalProjects: number;
    completedProjects: number;
    activeProjects: number;
    totalContractValue: number;
    averageRating: number;
    totalReviews: number;
  };
  userBreakdown: {
    contractors: number;
    buyers: number;
    admins: number;
  };
  projectStatus: {
    draft: number;
    pending: number;
    active: number;
    completed: number;
    cancelled: number;
  };
  dailyActivity: Array<{
    date: string;
    projects: number;
    users: number;
  }>;
  averageProjectValue: number;
};

export function AdminDashboard({ analytics }: { analytics: AnalyticsData }) {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.overview.totalUsers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Projects
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.overview.activeProjects}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.projectStatus.pending} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Contract Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₱{(analytics.overview.totalContractValue / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg. ₱{(analytics.averageProjectValue / 1000).toFixed(0)}K per
              project
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Platform Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.overview.averageRating.toFixed(1)} / 5.0
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on {analytics.overview.totalReviews} reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="contractors">Contractors</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <PlatformMetrics analytics={analytics} />
          <RecentActivity />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UserManagement />
        </TabsContent>

        <TabsContent value="contractors" className="space-y-4">
          <ContractorManagement />
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <ProjectManagement />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <SystemSettings />
          <ReportsExport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
