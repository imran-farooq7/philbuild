// app/(dashboard)/buyer/page.tsx
import { BuyerDashboard } from "@/components/buyer/buyer-dashboard";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import Loading from "../admin/loading";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function BuyerDashboardPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Buyer Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your construction projects and contractor relationships
          </p>
        </div>
        <form action={logout}>
          <Button type="submit" variant="outline">
            Log out
          </Button>
        </form>
      </div>

      <Suspense fallback={<Loading />}>
        <BuyerDashboard />
      </Suspense>
    </div>
  );
}

async function logout() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
