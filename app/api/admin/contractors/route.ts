// app/api/admin/contractors/route.ts
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
    const adminSupabase = createAdminClient();
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (profile?.user_type !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all contractors with profile data
    const { data: contractors, error } = await adminSupabase
      .from("contractors")
      .select(
        `
        *,
        profile:profiles!contractors_user_id_fkey (
          id,
          full_name,
          email,
          phone,
          avatar_url,
          created_at
        )
      `,
      )
      .order("created_at", { ascending: false });
    console.log(
      error?.code,
      error?.message,
      "error from supabase query in route.ts",
    );
    if (error) throw error;

    return NextResponse.json(contractors);
  } catch (error) {
    console.error("Error fetching contractors:", error);
    return NextResponse.json(
      { error: "Failed to fetch contractors" },
      { status: 500 },
    );
  }
}
