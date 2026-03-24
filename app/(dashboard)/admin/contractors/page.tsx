// app/(dashboard)/admin/contractors/page.tsx
import { getPendingContractors } from "@/actions/contractors";
import { PendingContractorsList } from "@/components/admin/pending-contractors-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Suspense } from "react";

export default function AdminContractorsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Contractor Verification</h1>
        <p className="text-muted-foreground">
          Review and verify contractor applications
        </p>
      </div>

      <Tabs defaultValue="pending" className="flex flex-col gap-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({getPendingContractors?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Applications</CardTitle>
              <CardDescription>
                Review contractor applications and verify their credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<PendingListFallback />}>
                <PendingContractorsSection />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

async function PendingContractorsSection() {
  const pendingContractors = await getPendingContractors();

  return <PendingContractorsList contractors={pendingContractors || []} />;
}

function PendingListFallback() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
