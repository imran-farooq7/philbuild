// components/projects/project-inspections.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  FileText,
  ImageIcon,
  ThumbsDown,
  ThumbsUp,
  XCircle,
} from "lucide-react";
import { InspectionForm } from "./inspection-form";

type Inspection = {
  id: string;
  type: string;
  inspection_date: string;
  findings: string;
  recommendations: string;
  photos: string[];
  passed: boolean;
  status: string;
  inspector_id: string;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
  };
  created_at: string;
};

type ProjectInspectionsProps = {
  projectId: string;
  userRole: string;
};

export function ProjectInspections({
  projectId,
  userRole,
}: ProjectInspectionsProps) {
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [selectedInspection, setSelectedInspection] =
    useState<Inspection | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch inspections (this would normally come from server)
  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    const response = await fetch(`/api/projects/${projectId}/inspections`);
    const data = await response.json();
    setInspections(data.inspections || []);
  };

  const getInspectionTypeLabel = (type: string) => {
    switch (type) {
      case "initial":
        return "Initial Inspection";
      case "progress":
        return "Progress Inspection";
      case "final":
        return "Final Inspection";
      case "special":
        return "Special Inspection";
      default:
        return type;
    }
  };

  const getInspectionTypeColor = (type: string) => {
    switch (type) {
      case "initial":
        return "bg-blue-500";
      case "progress":
        return "bg-yellow-500";
      case "final":
        return "bg-green-500";
      case "special":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const getFilteredInspections = () => {
    if (activeTab === "all") return inspections;
    if (activeTab === "passed") return inspections.filter((i) => i.passed);
    if (activeTab === "failed") return inspections.filter((i) => !i.passed);
    return inspections.filter((i) => i.type === activeTab);
  };

  const filteredInspections = getFilteredInspections();

  return (
    <div className="space-y-6">
      {/* Header with Submit Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Inspection Reports</h3>
          <p className="text-sm text-muted-foreground">
            Quality assurance and compliance inspections
          </p>
        </div>
        {(userRole === "buyer" || userRole === "admin") && (
          <Dialog
            open={showInspectionForm}
            onOpenChange={setShowInspectionForm}
          >
            <DialogTrigger asChild>
              <Button>Schedule Inspection</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New Inspection Report</DialogTitle>
                <DialogDescription>
                  Document inspection findings and quality assessment
                </DialogDescription>
              </DialogHeader>
              <InspectionForm
                projectId={projectId}
                onSuccess={() => {
                  setShowInspectionForm(false);
                  fetchInspections();
                }}
                onCancel={() => setShowInspectionForm(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Tabs for filtering */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="passed">Passed</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
          <TabsTrigger value="initial">Initial</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredInspections.map((inspection) => (
            <Card
              key={inspection.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={getInspectionTypeColor(inspection.type)}
                      >
                        {getInspectionTypeLabel(inspection.type)}
                      </Badge>
                      {inspection.passed ? (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Passed
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-red-50 text-red-700 border-red-200"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Failed
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Inspected on {formatDate(inspection.inspection_date)}
                      </span>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedInspection(inspection)}
                      >
                        View Details
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {/* Findings Preview */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Findings:
                    </p>
                    <p className="text-sm mt-1 line-clamp-2">
                      {inspection.findings}
                    </p>
                  </div>

                  {/* Photos Preview */}
                  {inspection.photos && inspection.photos.length > 0 && (
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {inspection.photos.length} photo(s)
                      </span>
                    </div>
                  )}

                  {/* Inspector Info */}
                  {inspection.profiles && (
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={inspection.profiles.avatar_url || undefined}
                        />
                        <AvatarFallback>
                          {inspection.profiles.full_name?.charAt(0) || "I"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        Inspected by: {inspection.profiles.full_name}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredInspections.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-lg font-semibold">No Inspections Yet</h3>
                <p className="text-muted-foreground">
                  {userRole === "buyer"
                    ? "Schedule inspections to ensure quality standards are being met."
                    : "Inspections will appear here once they are scheduled by the project owner."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Inspection Details Dialog */}
      <Dialog
        open={!!selectedInspection}
        onOpenChange={() => setSelectedInspection(null)}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedInspection && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getInspectionTypeLabel(selectedInspection.type)} Report
                  {selectedInspection.passed ? (
                    <ThumbsUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <ThumbsDown className="h-5 w-5 text-red-500" />
                  )}
                </DialogTitle>
                <DialogDescription>
                  Conducted on {formatDate(selectedInspection.inspection_date)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Inspector Info */}
                {selectedInspection.profiles && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={
                          selectedInspection.profiles.avatar_url || undefined
                        }
                      />
                      <AvatarFallback>
                        {selectedInspection.profiles.full_name?.charAt(0) ||
                          "I"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {selectedInspection.profiles.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">Inspector</p>
                    </div>
                  </div>
                )}

                {/* Findings Section */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    Inspection Findings
                  </h4>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">
                      {selectedInspection.findings}
                    </p>
                  </div>
                </div>

                {/* Recommendations Section */}
                {selectedInspection.recommendations && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4 text-blue-500" />
                      Recommendations
                    </h4>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="whitespace-pre-wrap">
                        {selectedInspection.recommendations}
                      </p>
                    </div>
                  </div>
                )}

                {/* Photos Section */}
                {selectedInspection.photos &&
                  selectedInspection.photos.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-purple-500" />
                        Inspection Photos ({selectedInspection.photos.length})
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {selectedInspection.photos.map((photo, index) => (
                          <div
                            key={index}
                            className="relative cursor-pointer group"
                            onClick={() => window.open(photo, "_blank")}
                          >
                            <img
                              src={photo}
                              alt={`Inspection photo ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg hover:opacity-90 transition-opacity"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <p className="text-white text-sm">
                                Click to view
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Status Summary */}
                <div className="p-4 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Inspection Result:
                    </span>
                    {selectedInspection.passed ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-semibold">PASSED</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600">
                        <XCircle className="h-5 w-5" />
                        <span className="font-semibold">FAILED</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm font-medium">Report Date:</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(selectedInspection.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
