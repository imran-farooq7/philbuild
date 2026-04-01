// app/api/admin/projects/route.ts
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (profile?.user_type !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const adminSupabase = await createAdminClient();
    // Get all projects with buyer and contractor info
    const { data: projects, error } = await adminSupabase
      .from("projects")
      .select(
        `
        *,
        buyers:buyer_id (
          id,
          company_name,
          profiles!buyers_user_id_fkey (
            id,
            full_name,
            email
          )
        ),
        contractors:contractor_id (
          id,
          company_name
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}
