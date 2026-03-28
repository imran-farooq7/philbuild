// components/admin/verified-contractors-list.tsx
"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

export function VerifiedContractorsList({
  contractors,
}: {
  contractors: Contractor[];
}) {
  return (
    <div className="space-y-4">
      {contractors.map((contractor) => (
        <Card key={contractor.id} className="p-6">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">
                  {contractor.company_name}
                </h3>
                <Badge variant="secondary">Verified</Badge>
                {contractor.tier && (
                  <Badge variant="outline">
                    {contractor.tier.toUpperCase()} Tier
                  </Badge>
                )}
              </div>
              {/* <p className="text-sm text-muted-foreground">
                Contact: {contractor.profiles.full_name} |{" "}
                {contractor.profiles.email}
              </p> */}
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
          </div>
        </Card>
      ))}

      {contractors.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No verified contractors yet
        </div>
      )}
    </div>
  );
}
