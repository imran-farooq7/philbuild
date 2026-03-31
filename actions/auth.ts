// app/actions/auth.ts (Updated with better error handling and email confirmation)
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const userType = formData.get("userType") as "contractor" | "buyer";
  const phone = (formData.get("phone") as string) || null;

  // Validate input
  if (!email || !password || !fullName || !userType) {
    return { error: "All fields are required" };
  }

  // Password validation
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  if (!/[A-Z]/.test(password)) {
    return { error: "Password must contain at least one uppercase letter" };
  }

  if (!/[a-z]/.test(password)) {
    return { error: "Password must contain at least one lowercase letter" };
  }

  if (!/[0-9]/.test(password)) {
    return { error: "Password must contain at least one number" };
  }

  try {
    // Create auth user with metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          user_type: userType,
          phone: phone,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (authError) {
      console.error("Auth error:", authError);
      if (authError.message.includes("User already registered")) {
        return { error: "An account with this email already exists" };
      }
      return { error: authError.message };
    }

    if (!authData.user) {
      return { error: "Failed to create user account" };
    }

    // Create profile record
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      email,
      full_name: fullName,
      user_type: userType,
      phone,
    });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Profile creation failed, but auth user was created
      // We should handle this gracefully
      return {
        error:
          "Account created but profile setup failed. Please contact support.",
      };
    }

    // Create role-specific record
    if (userType === "contractor") {
      const { error: contractorError } = await supabase
        .from("contractors")
        .insert({
          user_id: authData.user.id,
          company_name: "", // Will be filled during onboarding
          verification_status: "pending",
          verification_score: 0,
          total_projects_completed: 0,
        });

      if (contractorError) {
        console.error("Contractor creation error:", contractorError);
        return {
          error:
            "Account created but contractor setup failed. Please contact support.",
        };
      }
    } else if (userType === "buyer") {
      const { error: buyerError } = await supabase.from("buyers").insert({
        user_id: authData.user.id,
        verified_phone: false,
        total_projects_initiated: 0,
      });

      if (buyerError) {
        console.error("Buyer creation error:", buyerError);
        return {
          error:
            "Account created but buyer setup failed. Please contact support.",
        };
      }
    }

    // Log user activity
    await supabase.from("user_activity").insert({
      user_id: authData.user.id,
      action: "user_register",
      entity_type: "user",
      entity_id: authData.user.id,
      metadata: { user_type: userType },
    });

    revalidatePath("/");

    // Return success - no redirect here as we want to show confirmation message
    return { success: true, requiresEmailConfirmation: true };
  } catch (error) {
    console.error("Signup error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function resendConfirmationEmail(email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
