// app/api/buyer/recommended-contractors/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get verified contractors with high scores
    const { data: contractors, error } = await supabase
      .from("contractors")
      .select(
        `
        id,
        user_id,
        company_name,
        verification_score,
        tier,
        total_projects_completed,
        average_rating,
        certifications,
        profile:profiles (
          full_name,
          avatar_url
        ),
        contractor_specialties (
          specialty
        )
      `,
      )
      .eq("verification_status", "verified")
      .order("verification_score", { ascending: false })
      .limit(8);

    if (error) throw error;

    // Calculate match score based on various factors
    const recommendedContractors = contractors.map((contractor) => ({
      ...contractor,
      specialties:
        contractor.contractor_specialties?.map((s) => s.specialty) || [],
      match_score: calculateMatchScore(contractor),
    }));

    return NextResponse.json(recommendedContractors);
  } catch (error) {
    console.error("Error fetching recommended contractors:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 },
    );
  }
}

function calculateMatchScore(contractor: any): number {
  let score = 0;

  // Base score from verification score
  score += contractor.verification_score * 0.4;

  // Bonus for completed projects
  score += Math.min(contractor.total_projects_completed * 2, 30);

  // Bonus for high rating
  if (contractor.average_rating) {
    score += contractor.average_rating * 6;
  }

  // Tier bonus
  switch (contractor.tier) {
    case "platinum":
      score += 20;
      break;
    case "gold":
      score += 15;
      break;
    case "silver":
      score += 10;
      break;
    case "bronze":
      score += 5;
      break;
  }

  return Math.min(Math.round(score), 100);
}
