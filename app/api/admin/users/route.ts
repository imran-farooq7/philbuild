// app/api/admin/users/route.ts
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Use the cookie-based client to identify the caller
    const supabase = await createClient();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log(user, "supabase user from route.ts");
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

    // Use admin client for privileged reads
    const admin = createAdminClient();

    // Get all users with their profiles
    const { data: users, error } = await admin
      .from("profiles")
      .select(
        `
        *,
        contractors (
          id,
          company_name,
          verification_status,
          verification_score,
          tier,
          total_projects_completed,
          average_rating
        ),
        buyers (
          id,
          company_name,
          verified_phone,
          total_projects_initiated
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
