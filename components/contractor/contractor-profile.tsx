// components/contractor/contractor-profile.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Users,
  Calendar,
  Award,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

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
};

interface ContractorProfileProps {
  contractor: Contractor;
}

export function ContractorProfile({ contractor }: ContractorProfileProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Get tier color
  const getTierColor = (tier: string | null) => {
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

  // Get status badge
  const getStatusBadge = () => {
    switch (contractor.verification_status) {
      case "verified":
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-500 text-white">
            <Clock className="h-3 w-3 mr-1" /> Pending Verification
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="bg-linear-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <div className="flex justify-between items-start">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-white">
                <AvatarImage
                  src={`https://avatar.vercel.sh/${contractor.company_name}`}
                />
                <AvatarFallback className="text-2xl bg-white text-blue-600">
                  {contractor.company_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">
                  {contractor.company_name}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  {getStatusBadge()}
                  {contractor.tier && (
                    <Badge className={getTierColor(contractor.tier)}>
                      {contractor.tier.toUpperCase()} TIER
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                <div>
                  <p className="text-sm opacity-80">Years in Business</p>
                  <p className="font-semibold">
                    {contractor.years_in_business} years
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <div>
                  <p className="text-sm opacity-80">Team Size</p>
                  <p className="font-semibold">
                    {contractor.team_size} members
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                <div>
                  <p className="text-sm opacity-80">Projects Completed</p>
                  <p className="font-semibold">
                    {contractor.total_projects_completed}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                <div>
                  <p className="text-sm opacity-80">Rating</p>
                  <p className="font-semibold">
                    {contractor.average_rating || "No ratings yet"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {contractor.verification_status === "pending" && (
            <Button variant="secondary" disabled>
              <Clock className="h-4 w-4 mr-2" />
              Application Under Review
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="bg-muted">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Verification Score Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Verification Score
              </CardTitle>
              <CardDescription>
                Your credibility score based on experience, certifications, and
                documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">
                    {contractor.verification_score}/100
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {contractor.verification_score! >= 80
                      ? "Excellent"
                      : contractor.verification_score! >= 60
                        ? "Good"
                        : contractor.verification_score! >= 40
                          ? "Fair"
                          : "Needs Improvement"}
                  </span>
                </div>
                <Progress
                  value={contractor.verification_score}
                  className="h-2"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {contractor.verification_score! >= 80
                    ? "Congratulations! You have achieved the highest verification score."
                    : contractor.verification_score! >= 60
                      ? "Good work! Continue building your portfolio to increase your score."
                      : "Complete your profile and add more certifications to improve your score."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Company Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
              <CardDescription>
                Basic information about your company
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Company Name
                  </p>
                  <p className="mt-1">{contractor.company_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Member Since
                  </p>
                  <p className="mt-1">{formatDate(contractor.created_at!)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Years in Operation
                  </p>
                  <p className="mt-1">{contractor.years_in_business} years</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Team Size
                  </p>
                  <p className="mt-1">{contractor.team_size} employees</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                How clients can reach your company
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>
                  Contact email will be shown to clients after verification
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>
                  Contact number will be shown to clients after verification
                </span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  Business address will be shown to clients after verification
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certifications Tab */}
        <TabsContent value="certifications">
          <Card>
            <CardHeader>
              <CardTitle>Certifications & Accreditations</CardTitle>
              <CardDescription>
                Professional certifications that validate your expertise
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contractor.certifications &&
              contractor.certifications.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {contractor.certifications.map((cert, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <Award className="h-5 w-5 text-green-500" />
                      <span>{cert}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No certifications added yet</p>
                  <p className="text-sm">
                    Add certifications to increase your verification score
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Company Documents</CardTitle>
              <CardDescription>
                Official documents submitted for verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contractor.business_permit && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Business Permit</p>
                        <p className="text-sm text-muted-foreground">
                          Official business permit document
                        </p>
                      </div>
                    </div>
                    <Link href={contractor.business_permit} target="_blank">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                  </div>
                )}

                {contractor.pcab_license && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">PCAB License</p>
                        <p className="text-sm text-muted-foreground">
                          Philippine Contractors Accreditation Board License
                        </p>
                      </div>
                    </div>
                    <Link href={contractor.pcab_license} target="_blank">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                  </div>
                )}

                {contractor.bir_registration && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="font-medium">BIR Registration</p>
                        <p className="text-sm text-muted-foreground">
                          Certificate of Registration from BIR
                        </p>
                      </div>
                    </div>
                    <Link href={contractor.bir_registration} target="_blank">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                  </div>
                )}

                {!contractor.business_permit &&
                  !contractor.pcab_license &&
                  !contractor.bir_registration && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No documents uploaded yet</p>
                      <p className="text-sm">
                        Upload required documents to complete verification
                      </p>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Completed Projects</CardTitle>
              <CardDescription>
                Projects you have successfully completed through PHILbuild
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contractor.total_projects_completed! > 0 ? (
                <div className="space-y-4">
                  <div className="text-center p-6 bg-muted rounded-lg">
                    <p className="text-3xl font-bold">
                      {contractor.total_projects_completed}
                    </p>
                    <p className="text-muted-foreground">
                      Total Projects Completed
                    </p>
                  </div>
                  {/* Project list will be populated from projects table */}
                  <p className="text-center text-muted-foreground">
                    Your completed projects will appear here once you finish
                    projects through PHILbuild.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No completed projects yet</p>
                  <p className="text-sm">
                    Your completed projects will appear here once you start
                    working on projects
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Call to Action for Pending Status */}
      {contractor.verification_status === "pending" && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Clock className="h-6 w-6 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800">
                  Application Under Review
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Your contractor application is currently being reviewed by our
                  team. This process typically takes 3-5 business days. You will
                  be notified via email once the review is complete.
                </p>
                <p className="text-xs text-yellow-600 mt-2">
                  Submitted on {formatDate(contractor.created_at!)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call to Action for Verified Status */}
      {contractor.verification_status === "verified" && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-800">
                  You're Verified!
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  Congratulations! Your contractor profile has been verified.
                  You can now:
                </p>
                <ul className="list-disc list-inside text-sm text-green-700 mt-2 space-y-1">
                  <li>Receive project invitations from buyers</li>
                  <li>Bid on available projects</li>
                  <li>Access project management tools</li>
                  <li>Build your reputation through completed projects</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call to Action for Rejected Status */}
      {contractor.verification_status === "rejected" && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <XCircle className="h-6 w-6 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800">
                  Application Not Approved
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  Your contractor application was not approved at this time.
                  Please check your documents and ensure all requirements are
                  met.
                </p>
                <Button
                  variant="outline"
                  className="mt-3 border-red-300 text-red-700 hover:bg-red-50"
                  onClick={() => window.location.reload()}
                >
                  Update Application
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
