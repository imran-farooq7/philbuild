// components/buyer/recommended-contractors.tsx

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Award,
  Briefcase,
  MessageSquare,
  Star,
  TrendingUp,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";

type Contractor = {
  id: string;
  company_name: string;
  user_id: string;
  profile: {
    full_name: string;
    avatar_url: string | null;
  };
  verification_score: number;
  tier: string;
  total_projects_completed: number;
  average_rating: number;
  specialties: string[];
  match_score: number;
};

export async function RecommendedContractors() {
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
  const response = await fetch(`${baseUrl}/api/buyer/recommended-contractors`, {
    headers: cookieHeader ? { cookie: cookieHeader } : {},
  });
  const contractors = (await response.json()) as Contractor[];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "platinum":
        return "bg-gradient-to-r from-gray-400 to-gray-600 text-white";
      case "gold":
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case "silver":
        return "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800";
      case "bronze":
        return "bg-gradient-to-r from-amber-600 to-amber-700 text-white";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 50) return "text-yellow-600";
    return "text-gray-600";
  };

  if (contractors.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Award className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold">No recommendations yet</h3>
          <p className="text-muted-foreground">
            As you create more projects, we'll suggest contractors that match
            your needs
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {contractors.map((contractor) => (
        <Card key={contractor.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={contractor.profile.avatar_url || undefined}
                  />
                  <AvatarFallback>
                    {contractor.company_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">
                    {contractor.company_name}
                  </CardTitle>
                  <CardDescription>
                    {contractor.profile.full_name}
                  </CardDescription>
                </div>
              </div>
              <Badge className={getTierColor(contractor.tier)}>
                {contractor.tier?.toUpperCase() || "STANDARD"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Match Score */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Match Score</span>
              <span
                className={`text-2xl font-bold ${getMatchScoreColor(contractor.match_score)}`}
              >
                {contractor.match_score}%
              </span>
            </div>
            <Progress value={contractor.match_score} className="h-2" />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                  <p className="font-semibold">
                    {contractor.average_rating?.toFixed(1) || "No ratings"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Projects</p>
                  <p className="font-semibold">
                    {contractor.total_projects_completed}+
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Verification Score
                  </p>
                  <p className="font-semibold">
                    {contractor.verification_score}/100
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                  <p className="font-semibold">95%</p>
                </div>
              </div>
            </div>

            {/* Specialties */}
            {contractor.specialties && contractor.specialties.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {contractor.specialties.slice(0, 3).map((specialty, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
                {contractor.specialties.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{contractor.specialties.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex gap-2">
            <Link
              href={`/dashboard/buyer/contractors/${contractor.id}`}
              className="flex-1"
            >
              <Button variant="outline" className="w-full">
                View Profile
              </Button>
            </Link>
            <Button className="flex-1">
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
