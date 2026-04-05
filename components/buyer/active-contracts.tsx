// components/buyer/active-contracts.tsx

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";
import {
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";

type Contract = {
  id: string;
  project_id: string;
  project_title: string;
  contractor_id: string;
  contractor_name: string;
  contractor_avatar: string | null;
  contractor_tier: string;
  budget: number;
  current_cost: number;
  completion_percentage: number;
  start_date: string;
  end_date: string;
  last_activity: string;
  next_milestone: string;
  status: string;
};

export async function ActiveContracts() {
  const headersList = await headers();
  const envBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  let baseUrl = envBaseUrl;

  if (!baseUrl) {
    const host =
      headersList.get("x-forwarded-host") ?? headersList.get("host") ?? "";
    const protocol = headersList.get("x-forwarded-proto") ?? "http";
    baseUrl = host ? `${protocol}://${host}` : "";
  }

  const cookieHeader = headersList.get("cookie") ?? "";
  const response = await fetch(`${baseUrl}/api/buyer/active-contracts`, {
    headers: cookieHeader ? { cookie: cookieHeader } : {},
  });
  const contracts = (await response.json()) as Contract[];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "platinum":
        return "bg-gradient-to-r from-gray-400 to-gray-600";
      case "gold":
        return "bg-gradient-to-r from-yellow-400 to-yellow-600";
      case "silver":
        return "bg-gradient-to-r from-gray-300 to-gray-400";
      case "bronze":
        return "bg-gradient-to-r from-amber-600 to-amber-700";
      default:
        return "bg-gray-200";
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (contracts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold">No active contracts</h3>
          <p className="text-muted-foreground">
            Your active projects will appear here once you award contracts to
            contractors
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {contracts.map((contract) => {
        const daysRemaining = getDaysRemaining(contract.end_date);
        const isUrgent = daysRemaining < 14;

        return (
          <Card key={contract.id} className="overflow-hidden">
            <div
              className={`h-1 w-full ${isUrgent ? "bg-red-500" : "bg-green-500"}`}
            />
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={contract.contractor_avatar || undefined}
                    />
                    <AvatarFallback>
                      {contract.contractor_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">
                      {contract.project_title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground">
                        Contractor: {contract.contractor_name}
                      </span>
                      <Badge className={getTierColor(contract.contractor_tier)}>
                        {contract.contractor_tier?.toUpperCase() || "STANDARD"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Badge
                  variant={isUrgent ? "destructive" : "default"}
                  className="flex items-center gap-1"
                >
                  <Clock className="h-3 w-3" />
                  {daysRemaining} days remaining
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Project Progress</span>
                  <span className="font-semibold">
                    {contract.completion_percentage}%
                  </span>
                </div>
                <Progress
                  value={contract.completion_percentage}
                  className="h-2"
                />
              </div>

              {/* Budget Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Total Budget
                    </p>
                    <p className="font-semibold">
                      {formatCurrency(contract.budget)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Current Cost
                    </p>
                    <p className="font-semibold">
                      {formatCurrency(contract.current_cost)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Next Milestone
                    </p>
                    <p className="font-semibold text-sm">
                      {contract.next_milestone || "Progress review"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Last Activity */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  Last activity:{" "}
                  {formatDistanceToNow(new Date(contract.last_activity), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </CardContent>

            <div className="p-6 pt-0 flex gap-2">
              <Link
                href={`/dashboard/projects/${contract.project_id}`}
                className="flex-1"
              >
                <Button variant="outline" className="w-full">
                  View Project Details
                </Button>
              </Link>
              <Button variant="default" className="flex-1">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Contractor
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
