// app/api/buyer/active-contracts/route.ts
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

    // Get buyer profile
    const { data: buyer } = await supabase
      .from("buyers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!buyer) {
      return NextResponse.json(
        { error: "Buyer profile not found" },
        { status: 404 },
      );
    }

    // Get active projects with contractor details
    const { data: contracts, error } = await supabase
      .from("projects")
      .select(
        `
        id,
        title,
        budget,
        current_cost,
        completion_percentage,
        start_date,
        end_date,
        contractor:contractors!projects_contractor_id_fkey (
          id,
          company_name,
          tier,
          profile:profiles!contractors_user_id_fkey (
            full_name,
            avatar_url
          )
        )
      `,
      )
      .eq("buyer_id", buyer.id)
      .eq("status", "active");

    if (error) throw error;

    // Format contracts with additional calculated fields
    const formattedContracts = (contracts ?? []).map((contract) => ({
      id: contract.id,
      project_id: contract.id,
      project_title: contract.title,
      contractor_id: contract.contractor?.id,
      contractor_name: contract.contractor?.company_name,
      contractor_avatar: contract.contractor?.profile?.avatar_url,
      contractor_tier: contract.contractor?.tier,
      budget: contract.budget,
      current_cost: contract.current_cost,
      completion_percentage: contract.completion_percentage ?? 0,
      start_date: contract.start_date,
      end_date: contract.end_date,
      next_milestone: calculateNextMilestone(
        contract.completion_percentage ?? 0,
      ),
      status: "active",
    }));

    return NextResponse.json(formattedContracts);
  } catch (error) {
    console.error("Error fetching active contracts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contracts" },
      { status: 500 },
    );
  }
}

function calculateNextMilestone(completion: number): string {
  if (completion < 25) return "Foundation work completion";
  if (completion < 50) return "Structural framework";
  if (completion < 75) return "Finishing works";
  return "Final inspection";
}
