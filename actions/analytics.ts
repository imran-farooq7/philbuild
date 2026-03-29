// app/actions/analytics.ts
"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { subDays, format, startOfWeek, endOfWeek } from "date-fns";

export async function trackEvent(
  eventType: string,
  userId: string | null,
  projectId: string | null = null,
  metadata: any = {},
) {
  const supabase = await createAdminClient();

  await supabase.from("analytics_events").insert({
    event_type: eventType,
    user_id: userId,
    project_id: projectId,
    metadata,
  });
}

export async function trackUserActivity(
  userId: string,
  action: string,
  entityType: string | null = null,
  entityId: string | null = null,
  metadata: any = {},
) {
  const supabase = await createAdminClient();

  // Get IP and user agent from request (would need to pass from client)
  await supabase.from("user_activity").insert({
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata,
  });
}

export async function getPlatformAnalytics(days: number = 30) {
  const supabase = await createAdminClient();
  const startDate = subDays(new Date(), days);

  // Get user statistics
  const { data: userStats } = await supabase
    .from("profiles")
    .select("user_type, created_at")
    .gte("created_at", startDate.toISOString());

  // Get project statistics
  const { data: projectStats } = await supabase
    .from("projects")
    .select("status, budget, created_at")
    .gte("created_at", startDate.toISOString());

  // Get contract value statistics
  const { data: contractValues } = await supabase
    .from("projects")
    .select("budget, status")
    .eq("status", "completed");

  // Get review statistics
  const { data: reviewStats } = await supabase
    .from("reviews")
    .select("rating")
    .gte("created_at", startDate.toISOString());

  // Calculate daily activity
  const dailyActivity = [];
  for (let i = 0; i < days; i++) {
    const date = subDays(new Date(), i);
    const nextDate = subDays(date, 1);

    const { count: projectsCount } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .gte("created_at", nextDate.toISOString())
      .lt("created_at", date.toISOString());

    const { count: usersCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", nextDate.toISOString())
      .lt("created_at", date.toISOString());

    dailyActivity.unshift({
      date: format(date, "yyyy-MM-dd"),
      projects: projectsCount || 0,
      users: usersCount || 0,
    });
  }

  // Calculate total contract value
  const totalContractValue =
    contractValues?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0;

  // Calculate average rating
  const averageRating =
    reviewStats && reviewStats.length > 0
      ? reviewStats.reduce((sum, r) => sum + r.rating, 0) / reviewStats.length
      : 0;

  return {
    overview: {
      totalUsers: userStats?.length || 0,
      totalProjects: projectStats?.length || 0,
      completedProjects:
        projectStats?.filter((p) => p.status === "completed").length || 0,
      activeProjects:
        projectStats?.filter((p) => p.status === "active").length || 0,
      totalContractValue,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: reviewStats?.length || 0,
    },
    userBreakdown: {
      contractors:
        userStats?.filter((u) => u.user_type === "contractor").length || 0,
      buyers: userStats?.filter((u) => u.user_type === "buyer").length || 0,
      admins: userStats?.filter((u) => u.user_type === "admin").length || 0,
    },
    projectStatus: {
      draft: projectStats?.filter((p) => p.status === "draft").length || 0,
      pending: projectStats?.filter((p) => p.status === "pending").length || 0,
      active: projectStats?.filter((p) => p.status === "active").length || 0,
      completed:
        projectStats?.filter((p) => p.status === "completed").length || 0,
      cancelled:
        projectStats?.filter((p) => p.status === "cancelled").length || 0,
    },
    dailyActivity,
    averageProjectValue:
      projectStats && projectStats.length > 0
        ? projectStats.reduce((sum, p) => sum + (p.budget || 0), 0) /
          projectStats.length
        : 0,
  };
}

export async function getContractorAnalytics(contractorId: string) {
  const supabase = await createAdminClient();

  // Get projects by this contractor
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("contractor_id", contractorId);

  // Get reviews for this contractor
  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating, categories")
    .eq("reviewee_id", contractorId);

  // Calculate project timeline performance
  const projectsWithTimeline = projects?.filter(
    (p) => p.start_date && p.end_date && p.completion_percentage === 100,
  );
  const onTimeProjects =
    projectsWithTimeline?.filter((p) => {
      const actualEnd = new Date(p.updated_at!);
      const plannedEnd = new Date(p.end_date!);
      return actualEnd <= plannedEnd;
    }).length || 0;

  // Calculate budget performance
  const budgetVariance =
    projects?.map((p) => ({
      budget: p.budget || 0,
      currentCost: p.current_cost || 0,
      variance: (p.budget || 0) - (p.current_cost || 0),
    })) || [];

  const averageBudgetVariance =
    budgetVariance.length > 0
      ? budgetVariance.reduce((sum, b) => sum + b.variance, 0) /
        budgetVariance.length
      : 0;

  return {
    totalProjects: projects?.length || 0,
    completedProjects:
      projects?.filter((p) => p.status === "completed").length || 0,
    activeProjects: projects?.filter((p) => p.status === "active").length || 0,
    totalRevenue:
      projects?.reduce((sum, p) => sum + (p.current_cost || 0), 0) || 0,
    averageProjectValue:
      projects && projects.length > 0
        ? projects.reduce((sum, p) => sum + (p.budget || 0), 0) /
          projects.length
        : 0,
    onTimeProjectRate:
      projectsWithTimeline && projectsWithTimeline.length > 0
        ? (onTimeProjects / projectsWithTimeline.length) * 100
        : 0,
    averageBudgetVariance,
    averageRating:
      reviews && reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0,
    totalReviews: reviews?.length || 0,
  };
}
