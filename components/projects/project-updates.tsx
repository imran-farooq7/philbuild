// components/projects/project-updates.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Calendar, ImageIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { WeeklyReportForm } from "@/components/projects/weekly-report-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ProjectUpdates({
  projectId,
  userRole,
}: {
  projectId: string;
  userRole: string;
}) {
  const [showReportForm, setShowReportForm] = useState(false);
  const [updates, setUpdates] = useState<any[]>([]);
  const [currentProgress, setCurrentProgress] = useState(0);

  // Fetch updates (this would normally come from server)
  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    const response = await fetch(`/api/projects/${projectId}/updates`);
    const data = await response.json();
    setUpdates(data.updates || []);
    setCurrentProgress(data.currentProgress || 0);
  };

  const getWeekNumber = () => {
    // Calculate next week number based on existing updates
    return updates.length + 1;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  return (
    <div className="space-y-6">
      {/* Header with Submit Button */}
      {userRole === "contractor" && (
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Weekly Progress Reports</h3>
            <p className="text-sm text-muted-foreground">
              Submit regular updates to keep the client informed
            </p>
          </div>
          <Dialog open={showReportForm} onOpenChange={setShowReportForm}>
            <DialogTrigger asChild>
              <Button>Submit Weekly Report</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Submit Weekly Progress Report</DialogTitle>
                <DialogDescription>
                  Provide detailed updates on project progress
                </DialogDescription>
              </DialogHeader>
              <WeeklyReportForm
                projectId={projectId}
                weekNumber={getWeekNumber()}
                currentProgress={currentProgress}
                onSuccess={() => {
                  setShowReportForm(false);
                  fetchUpdates();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Progress Timeline */}
      {updates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Progress Timeline</CardTitle>
            <CardDescription>
              Track project completion over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {updates.map((update, index) => (
                <div key={update.id} className="relative">
                  {index < updates.length - 1 && (
                    <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-muted" />
                  )}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        {update.week_number}
                      </div>
                    </div>
                    <div className="flex-1 space-y-3 pb-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">
                            Week {update.week_number} Report
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Submitted on {formatDate(update.submitted_at)}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {update.completion_percentage}% Complete
                        </Badge>
                      </div>

                      <Progress
                        value={update.completion_percentage}
                        className="h-2"
                      />

                      <div className="bg-muted p-3 rounded-lg space-y-2">
                        <p className="text-sm">
                          <span className="font-medium">Accomplishments:</span>{" "}
                          {update.accomplishments}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Next Week Plans:</span>{" "}
                          {update.plans_for_next_week}
                        </p>
                        {update.issues_encountered && (
                          <p className="text-sm text-yellow-600">
                            <AlertCircle className="h-3 w-3 inline mr-1" />
                            <span className="font-medium">Issues:</span>{" "}
                            {update.issues_encountered}
                          </p>
                        )}
                      </div>

                      {/* Photos */}
                      {update.photos && update.photos.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {update.photos.map(
                            (photo: string, photoIndex: number) => (
                              <img
                                key={photoIndex}
                                src={photo}
                                alt={`Week ${update.week_number} progress`}
                                className="w-full h-24 object-cover rounded-lg cursor-pointer"
                                onClick={() => window.open(photo, "_blank")}
                              />
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Updates Message */}
      {updates.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-semibold">No Reports Yet</h3>
            <p className="text-muted-foreground">
              {userRole === "contractor"
                ? "Start submitting weekly reports to keep the client informed about project progress."
                : "Weekly reports will appear here once the contractor starts submitting updates."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
