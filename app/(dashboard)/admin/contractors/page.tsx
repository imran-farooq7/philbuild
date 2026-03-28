// app/(dashboard)/admin/contractors/page.tsx
import {
  getPendingContractors,
  getVerifiedContractors,
} from "@/actions/contractors";
import { PendingContractorsList } from "@/components/admin/pending-contractors-list";
import { VerifiedContractorsList } from "@/components/admin/verified-contractors-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function AdminContractorsPage() {
  const [pendingContractors, verifiedContractors] = await Promise.all([
    getPendingContractors(),
    getVerifiedContractors(),
  ]);

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
            Pending ({pendingContractors?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="verified">
            Verified ({verifiedContractors?.length || 0})
          </TabsTrigger>
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
              <PendingContractorsList
                contractors={pendingContractors || []}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verified">
          <Card>
            <CardHeader>
              <CardTitle>Verified Contractors</CardTitle>
              <CardDescription>
                Contractors who have passed the verification process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VerifiedContractorsList
                contractors={verifiedContractors || []}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
