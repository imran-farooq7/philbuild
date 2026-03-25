// app/(dashboard)/contractor/profile/page.tsx
import { ContractorProfile } from "@/components/contractor/contractor-profile";
import { ContractorRegistrationForm } from "@/components/contractor/contractor-registration-form";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function ContractorProfileContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Check if contractor profile exists and is complete
  const { data: contractor } = await supabase
    .from("contractors")
    .select("*")
    .eq("user_id", user!?.id)
    .single();

  // Check if profile is complete (has company name)
  const isProfileComplete =
    contractor?.company_name && contractor.company_name !== "";

  return !isProfileComplete ? (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Complete Your Profile</h1>
        <p className="text-muted-foreground">
          Provide your company details to become a verified contractor
        </p>
      </div>
      <ContractorRegistrationForm />
    </div>
  ) : (
    <ContractorProfile contractor={contractor} />
  );
}

export default function ContractorProfilePage() {
  return (
    <div className="container mx-auto py-10">
      <Suspense fallback={<Skeleton />}>
        <ContractorProfileContent />
      </Suspense>
    </div>
  );
}
