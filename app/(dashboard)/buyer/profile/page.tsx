// app/(dashboard)/buyer/profile/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { BuyerProfile } from "@/components/buyer/buyer-profile";
import { BuyerProfileForm } from "@/components/buyer/buyer-profile-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function BuyerProfilePage() {
  return (
    <Suspense fallback={<BuyerProfileFallback />}>
      <BuyerProfileContent />
    </Suspense>
  );
}

async function BuyerProfileContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Get buyer profile
  const { data: buyer } = await supabase
    .from("buyers")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (profile?.user_type !== "buyer") {
    redirect("/dashboard");
  }

  const isProfileComplete = buyer?.company_name && buyer.company_name !== "";

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Buyer Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your company profile and preferences
        </p>
      </div>

      {!isProfileComplete ? (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>
                Provide your company details to get the most out of PHILbuild
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BuyerProfileForm profile={profile} buyer={buyer!} />
            </CardContent>
          </Card>
        </div>
      ) : (
        <BuyerProfile profile={profile} buyer={buyer} />
      )}
    </div>
  );
}

function BuyerProfileFallback() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <div className="h-8 w-48 rounded bg-muted" />
        <div className="mt-3 h-4 w-72 rounded bg-muted" />
      </div>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="h-6 w-48 rounded bg-muted" />
            <div className="mt-2 h-4 w-64 rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-9 w-full rounded bg-muted" />
            <div className="mt-3 h-9 w-full rounded bg-muted" />
            <div className="mt-3 h-9 w-2/3 rounded bg-muted" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
