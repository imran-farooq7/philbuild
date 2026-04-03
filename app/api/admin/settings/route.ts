// app/api/admin/settings/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Get settings
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

    // Get settings from system_settings table
    const { data: settings, error } = await supabase
      .from("system_settings")
      .select("*")
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    // Return default settings if none exist
    return NextResponse.json(
      settings || {
        platformName: "PHILbuild",
        platformEmail: "support@philbuild.com",
        contactPhone: "+63 2 8123 4567",
        maintenanceMode: false,
        autoVerifyThreshold: 70,
        requireDocuments: true,
        verificationTimeout: 7,
        emailNotifications: true,
        pushNotifications: true,
        adminAlertEmail: "admin@philbuild.com",
        defaultProjectDuration: 90,
        maxBudgetLimit: 1000000000,
        requireInsurance: true,
        platformFee: 5,
        minPlatformFee: 1000,
        maxPlatformFee: 50000,
      },
    );
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

// Update settings
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const settings = await request.json();
    console.log(settings, "from settings route");

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

    // Upsert settings
    const { error } = await supabase.from("system_settings").upsert({
      id: 1,
      ...settings,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    });

    if (error) throw error;

    // Log activity
    await supabase.from("user_activity").insert({
      user_id: user.id,
      action: "update_system_settings",
      entity_type: "system",
      metadata: { settings_updated: Object.keys(settings) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
