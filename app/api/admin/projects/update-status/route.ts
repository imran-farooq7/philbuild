// app/api/admin/projects/update-status/route.ts
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const { projectId, status, note } = await request.json();

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

    // Update project status
    const { error: updateError } = await adminSupabase
      .from("projects")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    if (updateError) throw updateError;

    // Add admin note if provided
    if (note) {
      await supabase.from("project_updates").insert({
        project_id: projectId,
        week_number: 0,
        completion_percentage: 0,
        accomplishments: `Admin note: ${note}`,
        submitted_by: user.id,
        submitted_at: new Date().toISOString(),
      });
    }

    // Log activity
    await supabase.from("user_activity").insert({
      user_id: user.id,
      action: "update_project_status",
      entity_type: "project",
      entity_id: projectId,
      metadata: { new_status: status, note },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating project status:", error);
    return NextResponse.json(
      { error: "Failed to update project status" },
      { status: 500 },
    );
  }
}
