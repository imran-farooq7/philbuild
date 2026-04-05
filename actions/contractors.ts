// app/actions/contractor.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ContractorFormData = {
  companyName: string;
  businessPermit: File | null;
  pcabLicense: File | null;
  birRegistration: File | null;
  yearsInBusiness: number;
  teamSize: number;
  certifications: string[];
  specialties: string[];
  previousProjects: string[];
};

// Upload file to Supabase Storage
async function uploadFile(file: File, path: string) {
  const supabase = await createClient();
  const fileName = `${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage
    .from("contractor-documents")
    .upload(`${path}/${fileName}`, file);

  if (error) throw error;
  return data.path;
}

// Submit contractor application
export async function submitContractorApplication(formData: FormData) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Extract form data
  const companyName = formData.get("companyName") as string;
  const yearsInBusiness = parseInt(formData.get("yearsInBusiness") as string);
  const teamSize = parseInt(formData.get("teamSize") as string);
  const certifications = JSON.parse(
    (formData.get("certifications") as string) || "[]",
  );
  const specialties = JSON.parse(
    (formData.get("specialties") as string) || "[]",
  );
  const previousProjects = JSON.parse(
    (formData.get("previousProjects") as string) || "[]",
  );

  // Upload documents
  const businessPermit = formData.get("businessPermit") as File;
  const pcabLicense = formData.get("pcabLicense") as File;
  const birRegistration = formData.get("birRegistration") as File;

  let businessPermitUrl = null;
  let pcabLicenseUrl = null;
  let birRegistrationUrl = null;

  if (businessPermit && businessPermit.size > 0) {
    businessPermitUrl = await uploadFile(
      businessPermit,
      `${user.id}/business-permit`,
    );
  }
  if (pcabLicense && pcabLicense.size > 0) {
    pcabLicenseUrl = await uploadFile(pcabLicense, `${user.id}/pcab-license`);
  }
  if (birRegistration && birRegistration.size > 0) {
    birRegistrationUrl = await uploadFile(
      birRegistration,
      `${user.id}/bir-registration`,
    );
  }

  // Update contractor profile
  const { error: contractorError } = await supabase
    .from("contractors")
    .update({
      company_name: companyName,
      business_permit: businessPermitUrl,
      pcab_license: pcabLicenseUrl,
      bir_registration: birRegistrationUrl,
      years_in_business: yearsInBusiness,
      team_size: teamSize,
      certifications,
      verification_status: "pending",
      verification_score: calculateVerificationScore({
        yearsInBusiness,
        teamSize,
        certifications,
        hasBusinessPermit: !!businessPermitUrl,
        hasPcabLicense: !!pcabLicenseUrl,
        hasBirRegistration: !!birRegistrationUrl,
      }),
    })
    .eq("user_id", user.id);

  if (contractorError) {
    throw new Error(contractorError.message);
  }

  // Save specialties and previous projects to separate tables
  for (const specialty of specialties) {
    await supabase.from("contractor_specialties").insert({
      contractor_id: user.id,
      specialty,
    });
  }

  for (const project of previousProjects) {
    await supabase.from("contractor_previous_projects").insert({
      contractor_id: user.id,
      project_name: project,
    });
  }

  revalidatePath("/dashboard/contractor/profile");
  redirect("/dashboard/contractor/profile?status=pending");
}

// Calculate verification score
function calculateVerificationScore(data: {
  yearsInBusiness: number;
  teamSize: number;
  certifications: string[];
  hasBusinessPermit: boolean;
  hasPcabLicense: boolean;
  hasBirRegistration: boolean;
}): number {
  let score = 0;

  // Years in business (max 30 points)
  if (data.yearsInBusiness >= 10) score += 30;
  else if (data.yearsInBusiness >= 5) score += 20;
  else if (data.yearsInBusiness >= 2) score += 10;
  else score += 5;

  // Team size (max 20 points)
  if (data.teamSize >= 50) score += 20;
  else if (data.teamSize >= 20) score += 15;
  else if (data.teamSize >= 10) score += 10;
  else score += 5;

  // Certifications (max 30 points)
  const certPoints = Math.min(data.certifications.length * 10, 30);
  score += certPoints;

  // Documents (max 20 points)
  if (data.hasBusinessPermit) score += 7;
  if (data.hasPcabLicense) score += 7;
  if (data.hasBirRegistration) score += 6;

  return score;
}

// Admin: Get pending contractors
export async function getPendingContractors() {
  const supabase = createAdminClient();

  const { data: contractors, error } = await supabase
    .from("contractors")
    .select(
      `
      *,
      profiles!contractors_user_id_fkey (full_name, email, phone)
    `,
    )
    .eq("verification_status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return contractors;
}

// Admin: Get verified contractors
export async function getVerifiedContractors() {
  const supabase = createAdminClient();

  const { data: contractors, error } = await supabase
    .from("contractors")
    .select(
      `
      *,
      profiles!contractors_user_id_fkey (full_name, email, phone)
    `,
    )
    .eq("verification_status", "verified")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return contractors;
}

// Admin: Verify contractor
export async function verifyContractor(
  contractorId: string,
  approved: boolean,
  notes?: string,
) {
  const supabase = await createClient();

  // Get current admin user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single();

  if (profile?.user_type !== "admin") {
    throw new Error("Unauthorized: Admin only");
  }

  const status = approved ? "verified" : "rejected";

  // Update contractor status
  const { error } = await supabase
    .from("contractors")
    .update({
      verification_status: status,
      tier: approved ? await calculateTierFromScore(contractorId) : null,
    })
    .eq("id", contractorId);

  if (error) throw error;

  // Log verification
  await supabase.from("verification_logs").insert({
    contractor_id: contractorId,
    admin_id: user.id,
    status,
    notes,
    previous_score: await getContractorScore(contractorId),
  });

  revalidatePath("/admin/contractors");
  return { success: true };
}

// Calculate tier based on score
async function calculateTierFromScore(contractorId: string) {
  const supabase = await createClient();

  const { data: contractor } = await supabase
    .from("contractors")
    .select("verification_score")
    .eq("id", contractorId)
    .single();

  const score = contractor?.verification_score || 0;

  if (score >= 80) return "platinum";
  if (score >= 60) return "gold";
  if (score >= 40) return "silver";
  return "bronze";
}

// Get contractor score
async function getContractorScore(contractorId: string) {
  const supabase = await createClient();

  const { data: contractor } = await supabase
    .from("contractors")
    .select("verification_score")
    .eq("id", contractorId)
    .single();

  return contractor?.verification_score || 0;
}

// Get contractor by ID (Server Component)
export async function getContractorById(contractorId: string) {
  const supabase = await createClient();

  const { data: contractor, error } = await supabase
    .from("contractors")
    .select(
      `
      *,
      profiles!contractors_user_id_fkey (full_name, email, phone, avatar_url),
      contractor_specialties (specialty),
      contractor_previous_projects (project_name, year_completed)
    `,
    )
    .eq("id", contractorId)
    .single();

  if (error) throw error;
  return contractor;
}
