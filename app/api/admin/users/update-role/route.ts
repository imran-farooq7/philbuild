// app/api/admin/users/update-role/route.ts
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { userId, role } = await request.json();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (adminProfile?.user_type !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update user role in profiles
    const adminSupabase = createAdminClient();

    const {
      statusText,
      error: profileError,
      data,
    } = await adminSupabase
      .from("profiles")
      .update({ user_type: role })
      .eq("id", userId);

    if (profileError) throw profileError;

    // Handle role-specific record creation/deletion
    if (role === "contractor") {
      // Check if contractor record exists
      const { data: existingContractor } = await adminSupabase
        .from("contractors")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (!existingContractor) {
        await adminSupabase.from("contractors").insert({
          user_id: userId,
          company_name: "",
          verification_status: "pending",
          verification_score: 0,
          total_projects_completed: 0,
        });
      }
    } else if (role === "buyer") {
      const { data: existingBuyer } = await adminSupabase
        .from("buyers")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (!existingBuyer) {
        await adminSupabase.from("buyers").insert({
          user_id: userId,
          verified_phone: false,
          total_projects_initiated: 0,
        });
      }
    }

    // Log activity
    await adminSupabase.from("user_activity").insert({
      user_id: user.id,
      action: "update_user_role",
      entity_type: "user",
      entity_id: userId,
      metadata: { new_role: role },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 },
    );
  }
}
