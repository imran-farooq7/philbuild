// components/admin/contractor-management.tsx
"use client";

import { verifyContractor } from "@/actions/contractors";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Award,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Loader2,
  Search,
  Star,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Contractor = {
  id: string;
  user_id: string;
  company_name: string;
  business_permit: string | null;
  pcab_license: string | null;
  bir_registration: string | null;
  years_in_business: number;
  team_size: number;
  certifications: string[];
  verification_status: "pending" | "verified" | "rejected";
  verification_score: number;
  tier: string | null;
  total_projects_completed: number;
  average_rating: number | null;
  created_at: string;
  profile: {
    full_name: string;
    email: string;
    phone: string;
    avatar_url: string | null;
  };
};

export function ContractorManagement() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContractor, setSelectedContractor] =
    useState<Contractor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  useEffect(() => {
    fetchContractors();
  }, []);

  const fetchContractors = async () => {
    try {
      const response = await fetch("/api/admin/contractors");

      const data = await response.json();
      setContractors(data);
    } catch (error) {
      console.error("Error fetching contractors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (
    contractorId: string,
    approved: boolean,
    notes?: string,
  ) => {
    try {
      setVerifyingId(contractorId);
      await verifyContractor(contractorId, approved, notes);
      toast(
        approved
          ? "The contractor has been successfully verified"
          : "The application has been rejected",
      );
      fetchContractors();
      setSelectedContractor(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to process request",
      );
    } finally {
      setVerifyingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" /> Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500">
            <Clock className="h-3 w-3 mr-1" /> Pending
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

  const getTierColor = (tier: string | null) => {
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

  const filteredContractors = contractors.filter(
    (contractor) =>
      contractor.company_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      contractor.profile.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const pendingCount = contractors.filter(
    (c) => c.verification_status === "pending",
  ).length;
  const verifiedCount = contractors.filter(
    (c) => c.verification_status === "verified",
  ).length;
  const rejectedCount = contractors.filter(
    (c) => c.verification_status === "rejected",
  ).length;

  return (
    <Card>
      {isLoading ? (
        <Loader2 className="mx-auto animate-spin w-8 h-8" size="xl" />
      ) : (
        <>
          <CardHeader>
            <CardTitle>Contractor Management</CardTitle>
            <CardDescription>
              Verify contractors and manage their credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contractors by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">
                  All ({contractors.length})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending ({pendingCount})
                </TabsTrigger>
                <TabsTrigger value="verified">
                  Verified ({verifiedCount})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected ({rejectedCount})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                <ContractorTable
                  contractors={filteredContractors}
                  onViewDetails={setSelectedContractor}
                  onVerify={(id) => handleVerify(id, true)}
                  verifyingId={verifyingId}
                />
              </TabsContent>

              <TabsContent value="pending" className="space-y-4">
                <ContractorTable
                  contractors={filteredContractors.filter(
                    (c) => c.verification_status === "pending",
                  )}
                  onViewDetails={setSelectedContractor}
                  onVerify={(id) => handleVerify(id, true)}
                  verifyingId={verifyingId}
                />
              </TabsContent>

              <TabsContent value="verified" className="space-y-4">
                <ContractorTable
                  contractors={filteredContractors.filter(
                    (c) => c.verification_status === "verified",
                  )}
                  onViewDetails={setSelectedContractor}
                  onVerify={(id) => handleVerify(id, true)}
                  verifyingId={verifyingId}
                />
              </TabsContent>

              <TabsContent value="rejected" className="space-y-4">
                <ContractorTable
                  contractors={filteredContractors.filter(
                    (c) => c.verification_status === "rejected",
                  )}
                  onViewDetails={setSelectedContractor}
                  onVerify={(id) => handleVerify(id, true)}
                  verifyingId={verifyingId}
                />
              </TabsContent>
            </Tabs>

            {/* Contractor Details Dialog */}
            <Dialog
              open={!!selectedContractor}
              onOpenChange={() => setSelectedContractor(null)}
            >
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                {selectedContractor && (
                  <>
                    <DialogHeader>
                      <DialogTitle>Review Contractor Application</DialogTitle>
                      <DialogDescription>
                        Verify documents and company information
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                      {/* Header */}
                      <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                        <Avatar className="h-16 w-16">
                          <AvatarImage
                            src={
                              selectedContractor.profile.avatar_url || undefined
                            }
                          />
                          <AvatarFallback className="text-2xl">
                            {selectedContractor.company_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-semibold">
                              {selectedContractor.company_name}
                            </h3>
                            {getStatusBadge(
                              selectedContractor.verification_status,
                            )}
                            {selectedContractor.tier && (
                              <Badge
                                className={getTierColor(
                                  selectedContractor.tier,
                                )}
                              >
                                {selectedContractor.tier.toUpperCase()} TIER
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground">
                            {selectedContractor.profile.email}
                          </p>
                          <p className="text-sm">
                            {selectedContractor.profile.phone}
                          </p>
                        </div>
                      </div>

                      {/* Company Details */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Years in Business
                          </p>
                          <p className="font-medium">
                            {selectedContractor.years_in_business} years
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Team Size
                          </p>
                          <p className="font-medium">
                            {selectedContractor.team_size} employees
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Verification Score
                          </p>
                          <div className="space-y-1">
                            <p className="font-medium">
                              {selectedContractor.verification_score}/100
                            </p>
                            <Progress
                              value={selectedContractor.verification_score}
                              className="h-2"
                            />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Projects Completed
                          </p>
                          <p className="font-medium">
                            {selectedContractor.total_projects_completed}
                          </p>
                        </div>
                      </div>

                      {/* Certifications */}
                      {selectedContractor.certifications.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Certifications</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedContractor.certifications.map(
                              (cert, idx) => (
                                <Badge key={idx} variant="outline">
                                  <Award className="h-3 w-3 mr-1" />
                                  {cert}
                                </Badge>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      {/* Documents */}
                      <div>
                        <h4 className="font-semibold mb-2">Documents</h4>
                        <div className="space-y-2">
                          {selectedContractor.business_permit && (
                            <div className="flex items-center justify-between p-2 border rounded">
                              <span>Business Permit</span>
                              <Button variant="ghost" size="sm" asChild>
                                <a
                                  href={selectedContractor.business_permit}
                                  target="_blank"
                                >
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          )}
                          {selectedContractor.pcab_license && (
                            <div className="flex items-center justify-between p-2 border rounded">
                              <span>PCAB License</span>
                              <Button variant="ghost" size="sm" asChild>
                                <a
                                  href={selectedContractor.pcab_license}
                                  target="_blank"
                                >
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          )}
                          {selectedContractor.bir_registration && (
                            <div className="flex items-center justify-between p-2 border rounded">
                              <span>BIR Registration</span>
                              <Button variant="ghost" size="sm" asChild>
                                <a
                                  href={selectedContractor.bir_registration}
                                  target="_blank"
                                >
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Rating */}
                      {selectedContractor.average_rating && (
                        <div>
                          <h4 className="font-semibold mb-2">Rating</h4>
                          <div className="flex items-center gap-2">
                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">
                              {selectedContractor.average_rating}
                            </span>
                            <span className="text-muted-foreground">/ 5.0</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <DialogFooter className="gap-2">
                      {selectedContractor.verification_status === "pending" && (
                        <>
                          <Button
                            variant="destructive"
                            onClick={() =>
                              handleVerify(selectedContractor.id, false)
                            }
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                          <Button
                            variant="default"
                            onClick={() =>
                              handleVerify(selectedContractor.id, true)
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => setSelectedContractor(null)}
                      >
                        Close
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </CardContent>
        </>
      )}
    </Card>
  );
}

function ContractorTable({
  contractors,
  onViewDetails,
  onVerify,
  verifyingId,
}: {
  contractors: Contractor[];
  onViewDetails: (c: Contractor) => void;
  onVerify: (id: string) => void;
  verifyingId: string | null;
}) {
  if (contractors.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No contractors found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Projects</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contractors.map((contractor) => (
            <TableRow key={contractor.id}>
              <TableCell className="font-medium">
                <div>
                  <div>{contractor.company_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {contractor.years_in_business} years
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{contractor.profile.full_name}</div>
                <div className="text-xs text-muted-foreground">
                  {contractor.profile.email}
                </div>
              </TableCell>
              <TableCell>
                {contractor.verification_status === "verified" && (
                  <Badge className="bg-green-500">Verified</Badge>
                )}
                {contractor.verification_status === "pending" && (
                  <Badge className="bg-yellow-500">Pending</Badge>
                )}
                {contractor.verification_status === "rejected" && (
                  <Badge variant="destructive">Rejected</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <span className="text-sm">
                    {contractor.verification_score}
                  </span>
                  <Progress
                    value={contractor.verification_score}
                    className="h-1"
                  />
                </div>
              </TableCell>
              <TableCell>{contractor.total_projects_completed}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {contractor.verification_status === "pending" && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onVerify(contractor.id)}
                      disabled={verifyingId === contractor.id}
                    >
                      {verifyingId === contractor.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Verifying
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Verify
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(contractor)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
