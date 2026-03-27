// components/projects/weekly-report-form.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ImagePlus, X } from "lucide-react";
import { submitWeeklyReport } from "@/actions/project";
import { toast } from "sonner";

type WeeklyReportFormProps = {
  projectId: string;
  weekNumber: number;
  currentProgress: number;
  onSuccess: () => void;
};

export function WeeklyReportForm({
  projectId,
  weekNumber,
  currentProgress,
  onSuccess,
}: WeeklyReportFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completionPercentage, setCompletionPercentage] =
    useState(currentProgress);
  const [accomplishments, setAccomplishments] = useState("");
  const [plansForNextWeek, setPlansForNextWeek] = useState("");
  const [issuesEncountered, setIssuesEncountered] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPhotos = [...photos, ...files];
    setPhotos(newPhotos);

    // Create preview URLs
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPhotoPreviews([...photoPreviews, ...newPreviews]);
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);

    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(photoPreviews[index]);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    setPhotoPreviews(newPreviews);
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);

    try {
      await submitWeeklyReport(formData);
      toast.success(
        `Week ${weekNumber} report has been submitted successfully`,
      );
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit report",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Progress Report - Week {weekNumber}</CardTitle>
        <CardDescription>
          Provide detailed updates on project progress, challenges, and next
          steps
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="weekNumber" value={weekNumber} />

          {/* Completion Percentage */}
          <div className="space-y-2">
            <Label>Completion Percentage</Label>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Current: {currentProgress}%
                </span>
                <span className="text-sm font-medium">
                  {completionPercentage}%
                </span>
              </div>
              <input
                type="range"
                name="completionPercentage"
                value={completionPercentage}
                onChange={(e) =>
                  setCompletionPercentage(parseInt(e.target.value))
                }
                min={currentProgress}
                max={100}
                step={1}
                className="w-full"
              />
              <Progress value={completionPercentage} className="h-2" />
            </div>
          </div>

          {/* Accomplishments */}
          <div className="space-y-2">
            <Label>Key Accomplishments</Label>
            <Textarea
              name="accomplishments"
              placeholder="What was accomplished this week? List key milestones, completed tasks, etc."
              value={accomplishments}
              onChange={(e) => setAccomplishments(e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Plans for Next Week */}
          <div className="space-y-2">
            <Label>Plans for Next Week</Label>
            <Textarea
              name="plansForNextWeek"
              placeholder="What are the plans and targets for next week?"
              value={plansForNextWeek}
              onChange={(e) => setPlansForNextWeek(e.target.value)}
              rows={3}
              required
            />
          </div>

          {/* Issues Encountered */}
          <div className="space-y-2">
            <Label>Issues Encountered</Label>
            <Textarea
              name="issuesEncountered"
              placeholder="Any challenges, delays, or issues encountered this week? How were they addressed?"
              value={issuesEncountered}
              onChange={(e) => setIssuesEncountered(e.target.value)}
              rows={3}
            />
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Progress Photos</Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <input
                type="file"
                name="photos"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <ImagePlus className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-1">
                  Click to upload photos
                </p>
                <p className="text-xs text-muted-foreground">
                  Upload progress photos to document the work
                </p>
              </label>
            </div>

            {/* Photo Previews */}
            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {photoPreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Progress photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Weekly Report"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
