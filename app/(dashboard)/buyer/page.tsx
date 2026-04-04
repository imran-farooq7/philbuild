// app/(dashboard)/buyer/page.tsx
import { BuyerDashboard } from "@/components/buyer/buyer-dashboard";
import { Suspense } from "react";
import Loading from "../admin/loading";

export default async function BuyerDashboardPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Buyer Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your construction projects and contractor relationships
        </p>
      </div>

      <Suspense fallback={<Loading />}>
        <BuyerDashboard />
      </Suspense>
    </div>
  );
}
