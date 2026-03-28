// app/actions/project.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type CreateProjectData = {
  title: string;
  description: string;
  budget: number;
  startDate: string;
  endDate: string;
  address: string;
  scope: string[];
  requirements: string[];
};

async function getReadClient() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return supabase;

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single();

  if (profile?.user_type === "admin") {
    return createAdminClient();
  }

  return supabase;
}

// Create new project
export async function createProject(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get buyer profile
  const { data: buyer } = await supabase
    .from("buyers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!buyer) throw new Error("Buyer profile not found");

  const projectData: CreateProjectData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    budget: parseFloat(formData.get("budget") as string),
    startDate: formData.get("startDate") as string,
    endDate: formData.get("endDate") as string,
    address: formData.get("address") as string,
    scope: JSON.parse((formData.get("scope") as string) || "[]"),
    requirements: JSON.parse((formData.get("requirements") as string) || "[]"),
  };

  // Create project
  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      title: projectData.title,
      description: projectData.description,
      buyer_id: buyer.id,
      budget: projectData.budget,
      current_cost: 0,
      start_date: projectData.startDate,
      end_date: projectData.endDate,
      address: projectData.address,
      status: "draft",
      completion_percentage: 0,
    })
    .select()
    .single();

  if (error) throw error;

  // Add project scope items
  for (const item of projectData.scope) {
    await supabase.from("project_scope").insert({
      project_id: project.id,
      description: item,
    });
  }

  // Add project requirements
  for (const req of projectData.requirements) {
    await supabase.from("project_requirements").insert({
      project_id: project.id,
      requirement: req,
    });
  }

  revalidatePath("/dashboard/projects");
  redirect(`/dashboard/projects/${project.id}`);
}

// Publish project for contractor bidding
export async function publishProject(projectId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("projects")
    .update({
      status: "pending",
      published_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  if (error) throw error;

  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}

// Get available projects for contractors (Server Component)
export async function getAvailableProjects() {
  const supabase = await getReadClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select(
      `
      *,
      buyers:buyer_id (
        profiles:user_id (full_name, email)
      ),
      project_scope (description)
    `,
    )
    .eq("status", "pending")
    .is("contractor_id", null)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return projects;
}

// Submit bid for project
export async function submitBid(
  projectId: string,
  bidAmount: number,
  proposal: string,
  timeline: number,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get contractor profile
  const { data: contractor } = await supabase
    .from("contractors")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!contractor) throw new Error("Contractor profile not found");

  // Check if already bid
  const { data: existingBid } = await supabase
    .from("bids")
    .select("id")
    .eq("project_id", projectId)
    .eq("contractor_id", contractor.id)
    .single();

  if (existingBid) {
    // Update existing bid
    const { error } = await supabase
      .from("bids")
      .update({
        amount: bidAmount,
        proposal,
        timeline_days: timeline,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingBid.id);

    if (error) throw error;
  } else {
    // Create new bid
    const { error } = await supabase.from("bids").insert({
      project_id: projectId,
      contractor_id: contractor.id,
      amount: bidAmount,
      proposal,
      timeline_days: timeline,
      status: "pending",
    });

    if (error) throw error;
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}

// Award project to contractor
export async function awardProject(
  projectId: string,
  contractorId: string,
  bidId: string,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Update project
  const { error: projectError } = await supabase
    .from("projects")
    .update({
      contractor_id: contractorId,
      status: "active",
      awarded_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  if (projectError) throw projectError;

  // Update bid status
  await supabase.from("bids").update({ status: "accepted" }).eq("id", bidId);

  // Reject other bids
  await supabase
    .from("bids")
    .update({ status: "rejected" })
    .eq("project_id", projectId)
    .neq("id", bidId);

  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}

// Add budget item
export async function addBudgetItem(formData: FormData) {
  const supabase = await createClient();

  const projectId = formData.get("projectId") as string;
  const category = formData.get("category") as string;
  const description = formData.get("description") as string;
  const allocatedAmount = parseFloat(formData.get("allocatedAmount") as string);

  const { error } = await supabase.from("budget_items").insert({
    project_id: projectId,
    category,
    description,
    allocated_amount: allocatedAmount,
    actual_amount: 0,
    status: "pending",
  });

  if (error) throw error;

  revalidatePath(`/dashboard/projects/${projectId}/budget`);
  return { success: true };
}

// Update budget item actual cost
export async function updateBudgetItemActual(
  itemId: string,
  actualAmount: number,
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("budget_items")
    .update({ actual_amount: actualAmount })
    .eq("id", itemId);

  if (error) throw error;

  const { data: budgetItem, error: budgetItemError } = await supabase
    .from("budget_items")
    .select("project_id")
    .eq("id", itemId)
    .single();

  if (budgetItemError) throw budgetItemError;
  if (!budgetItem?.project_id) throw new Error("Project not found");

  // Update project current cost
  const { data: budgetItems } = await supabase
    .from("budget_items")
    .select("actual_amount")
    .eq("project_id", budgetItem.project_id);

  const totalActual =
    budgetItems?.reduce((sum, item) => sum + (item.actual_amount || 0), 0) || 0;

  await supabase
    .from("projects")
    .update({ current_cost: totalActual })
    .eq("id", budgetItem.project_id);

  revalidatePath(`/dashboard/projects/*`);
  return { success: true };
}

// Submit weekly report
export async function submitWeeklyReport(formData: FormData) {
  const supabase = await createClient();

  const projectId = formData.get("projectId") as string;
  const weekNumber = parseInt(formData.get("weekNumber") as string);
  const completionPercentage = parseInt(
    formData.get("completionPercentage") as string,
  );
  const accomplishments = formData.get("accomplishments") as string;
  const plansForNextWeek = formData.get("plansForNextWeek") as string;
  const issuesEncountered = formData.get("issuesEncountered") as string;

  // Handle photo uploads
  const photos = formData.getAll("photos") as File[];
  const photoUrls: string[] = [];

  for (const photo of photos) {
    if (photo.size > 0) {
      const fileName = `${Date.now()}_${photo.name}`;
      const { data, error } = await supabase.storage
        .from("project-photos")
        .upload(`${projectId}/week-${weekNumber}/${fileName}`, photo);

      if (!error && data) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("project-photos").getPublicUrl(data.path);
        photoUrls.push(publicUrl);
      }
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("project_updates").insert({
    project_id: projectId,
    week_number: weekNumber,
    completion_percentage: completionPercentage,
    accomplishments,
    plans_for_next_week: plansForNextWeek,
    issues_encountered: issuesEncountered,
    photos: photoUrls,
    submitted_by: user?.id,
    submitted_at: new Date().toISOString(),
  });

  if (error) throw error;

  // Update project completion percentage
  await supabase
    .from("projects")
    .update({ completion_percentage: completionPercentage })
    .eq("id", projectId);

  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}

// Submit inspection report
export async function submitInspection(formData: FormData) {
  const supabase = await createClient();

  const projectId = formData.get("projectId") as string;
  const inspectionType = formData.get("type") as string;
  const findings = formData.get("findings") as string;
  const recommendations = formData.get("recommendations") as string;
  const passed = formData.get("passed") === "true";

  // Handle photo uploads
  const photos = formData.getAll("photos") as File[];
  const photoUrls: string[] = [];

  for (const photo of photos) {
    if (photo.size > 0) {
      const fileName = `${Date.now()}_${photo.name}`;
      const { data, error } = await supabase.storage
        .from("inspection-photos")
        .upload(`${projectId}/${fileName}`, photo);

      if (!error && data) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("inspection-photos").getPublicUrl(data.path);
        photoUrls.push(publicUrl);
      }
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("inspections").insert({
    project_id: projectId,
    inspector_id: user?.id,
    inspection_date: new Date().toISOString().split("T")[0],
    type: inspectionType,
    findings,
    recommendations,
    photos: photoUrls,
    passed,
    status: "completed",
  });

  if (error) throw error;

  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}

// Get project details with all related data (Server Component)
export async function getProjectDetails(projectId: string) {
  const supabase = await getReadClient();

  const { data: project, error } = await supabase
    .from("projects")
    .select(
      `
      *,
      buyers:buyer_id (
        id,
        profiles:user_id (full_name, email, phone)
      ),
      contractors:contractor_id (
        id,
        company_name,
        verification_score,
        tier,
        profiles!contractors_user_id_fkey (full_name, email, phone)
      ),
      project_scope (description),
      project_requirements (requirement),
      budget_items (*),
      project_updates (
        *,
        profiles:submitted_by (full_name)
      ),
      inspections (*)
    `,
    )
    .eq("id", projectId)
    .single();

  if (error) throw error;
  return project;
}

// Get project budget summary
export async function getBudgetSummary(projectId: string) {
  const supabase = await getReadClient();

  const { data: items } = await supabase
    .from("budget_items")
    .select("*")
    .eq("project_id", projectId);

  const totalAllocated =
    items?.reduce((sum, item) => sum + (item.allocated_amount || 0), 0) || 0;
  const totalActual =
    items?.reduce((sum, item) => sum + (item.actual_amount || 0), 0) || 0;
  const variance = totalAllocated - totalActual;

  return {
    totalAllocated,
    totalActual,
    variance,
    items,
    percentageUsed:
      totalAllocated > 0 ? (totalActual / totalAllocated) * 100 : 0,
  };
}

// Get project progress timeline
export async function getProjectProgress(projectId: string) {
  const supabase = await getReadClient();

  const { data: updates } = await supabase
    .from("project_updates")
    .select("week_number, completion_percentage, submitted_at")
    .eq("project_id", projectId)
    .order("week_number", { ascending: true });

  const { data: project } = await supabase
    .from("projects")
    .select("start_date, end_date, completion_percentage")
    .eq("id", projectId)
    .single();

  return {
    currentProgress: project?.completion_percentage || 0,
    startDate: project?.start_date,
    endDate: project?.end_date,
    updates: updates || [],
    projectedCompletion: calculateProjectedCompletion(updates || []),
  };
}

function calculateProjectedCompletion(updates: any[]) {
  if (updates.length < 2) return null;

  const recentUpdates = updates.slice(-3);
  const avgProgressRate =
    recentUpdates.reduce((sum, update, i) => {
      if (i === 0) return 0;
      const progressDiff =
        update.completion_percentage -
        recentUpdates[i - 1].completion_percentage;
      return sum + progressDiff;
    }, 0) /
    (recentUpdates.length - 1);

  const remainingProgress =
    100 - updates[updates.length - 1].completion_percentage;
  const weeksRemaining = remainingProgress / avgProgressRate;

  return {
    weeksRemaining: Math.ceil(weeksRemaining),
    avgProgressPerWeek: avgProgressRate,
  };
}
