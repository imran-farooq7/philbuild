// app/api/admin/activities/route.ts
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

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
    // Get user activities with user details
    const { data: activities, error } = await adminSupabase
      .from("user_activity")
      .select(
        `
        *,
        user:profiles!user_activity_user_id_fkey (
          id,
          full_name,
          avatar_url,
          user_type
        )
      `,
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 },
    );
  }
}
