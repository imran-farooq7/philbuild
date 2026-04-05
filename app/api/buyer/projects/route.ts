// app/api/buyer/projects/route.ts
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

    // Get projects
    const { data: projects, error } = await supabase
      .from("projects")
      .select(
        `
        *,
        contractor:contractors!projects_contractor_id_fkey (
          company_name,
          tier
        )
      `,
      )
      .eq("buyer_id", buyer.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    console.log(projects, "api route");
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching buyer projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}
