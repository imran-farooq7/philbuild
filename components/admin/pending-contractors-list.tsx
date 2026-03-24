// components/admin/pending-contractors-list.tsx
"use client";

import { useState } from "react";
import { verifyContractor } from "@/actions/contractors";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Check, X, Eye, Download } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type Contractor = {
  average_rating: number | null;
  bir_registration: string | null;
  business_permit: string | null;
  certifications: string[] | null;
  company_name: string;
  created_at: string | null;
  id: string;
  pcab_license: string | null;
  team_size: number | null;
  tier: string | null;
  total_projects_completed: number | null;
  updated_at: string | null;
  user_id: string;
  verification_score: number | null;
  verification_status: string | null;
  years_in_business: number | null;
  profiles: {
    full_name: string | null;
    email: string;
    phone: string | null;
  };
};

export function PendingContractorsList({
  contractors,
}: {
  contractors: Contractor[];
}) {
  const [selectedContractor, setSelectedContractor] =
    useState<Contractor | null>(null);
  const [notes, setNotes] = useState("");

  const handleVerify = async (contractorId: string, approved: boolean) => {
    try {
      await verifyContractor(contractorId, approved, notes);
      toast(
        approved
          ? "Contractor verified successfully."
          : "Application rejected.",
      );
      setSelectedContractor(null);
      setNotes("");
    } catch (error) {
      toast("An error occurred while verifying the contractor.");
    }
  };

  return (
    <div className="space-y-4">
      {contractors.map((contractor) => (
        <Card key={contractor.id} className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">
                {contractor.company_name}
              </h3>
              <p className="text-sm text-muted-foreground">
                Contact: {contractor.profiles.full_name} |{" "}
                {contractor.profiles.email}
              </p>
              <div className="flex gap-4 text-sm">
                <span>{contractor.years_in_business} years in business</span>
                <span>{contractor.team_size} team members</span>
                <Badge variant="outline">
                  Score: {contractor.verification_score}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {contractor.certifications?.map((cert) => (
                  <Badge key={cert} variant="secondary">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedContractor(contractor)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Review
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Review Contractor Application</DialogTitle>
                    <DialogDescription>
                      Verify documents and company information
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div>
                      <h4 className="font-semibold">Company Information</h4>
                      <p>Company: {contractor.company_name}</p>
                      <p>Years in Business: {contractor.years_in_business}</p>
                      <p>Team Size: {contractor.team_size}</p>
                      <p>
                        Verification Score: {contractor.verification_score}/100
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold">Contact Person</h4>
                      <p>Name: {contractor.profiles.full_name}</p>
                      <p>Email: {contractor.profiles.email}</p>
                      <p>
                        Phone: {contractor.profiles.phone || "Not provided"}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold">Documents</h4>
                      <div className="space-y-2 mt-2">
                        {contractor.business_permit && (
                          <Link
                            href={contractor.business_permit}
                            target="_blank"
                            className="flex items-center gap-2 text-blue-600 hover:underline"
                          >
                            <Download className="h-4 w-4" />
                            Business Permit
                          </Link>
                        )}
                        {contractor.pcab_license && (
                          <Link
                            href={contractor.pcab_license}
                            target="_blank"
                            className="flex items-center gap-2 text-blue-600 hover:underline"
                          >
                            <Download className="h-4 w-4" />
                            PCAB License
                          </Link>
                        )}
                        {contractor.bir_registration && (
                          <Link
                            href={contractor.bir_registration}
                            target="_blank"
                            className="flex items-center gap-2 text-blue-600 hover:underline"
                          >
                            <Download className="h-4 w-4" />
                            BIR Registration
                          </Link>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold">Certifications</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {contractor.certifications?.map((cert) => (
                          <Badge key={cert}>{cert}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold">Review Notes</h4>
                      <Textarea
                        placeholder="Add notes about this verification..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <DialogFooter className="gap-2">
                    <Button
                      variant="destructive"
                      onClick={() => handleVerify(contractor.id, false)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => handleVerify(contractor.id, true)}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </Card>
      ))}

      {contractors.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No pending applications to review
        </div>
      )}
    </div>
  );
}
