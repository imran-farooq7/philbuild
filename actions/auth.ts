// app/actions/auth.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type LoginState =
  | {
      error?: string;
      fieldErrors?: {
        email?: string;
        password?: string;
      };
    }
  | undefined;

export async function login(_state: LoginState, formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return {
      fieldErrors: {
        email: email ? undefined : "Email is required.",
        password: password ? undefined : "Password is required.",
      },
    };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const userType = formData.get("userType") as "contractor" | "buyer";

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        user_type: userType,
      },
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  if (authData.user) {
    // Create profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      email,
      full_name: fullName,
      user_type: userType,
    });

    if (profileError) {
      return { error: profileError.message };
    }

    // Create contractor or buyer record
    if (userType === "contractor") {
      await supabase.from("contractors").insert({
        user_id: authData.user.id,
        company_name: "",
        verification_status: "pending",
        verification_score: 0,
        total_projects_completed: 0,
      });
    } else {
      await supabase.from("buyers").insert({
        user_id: authData.user.id,
        verified_phone: false,
        total_projects_initiated: 0,
      });
    }
  }

  revalidatePath("/");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
