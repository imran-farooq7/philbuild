// components/projects/inspection-form.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ImagePlus, X } from "lucide-react";
import { submitInspection } from "@/actions/project";
import { toast } from "sonner";
import { error } from "console";

type InspectionFormProps = {
  projectId: string;
  onSuccess: () => void;
  onCancel: () => void;
};

export function InspectionForm({
  projectId,
  onSuccess,
  onCancel,
}: InspectionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inspectionType, setInspectionType] = useState("");
  const [findings, setFindings] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [passed, setPassed] = useState(true);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPhotos = [...photos, ...files];
    setPhotos(newPhotos);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPhotoPreviews([...photoPreviews, ...newPreviews]);
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);

    URL.revokeObjectURL(photoPreviews[index]);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    setPhotoPreviews(newPreviews);
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);

    try {
      await submitInspection(formData);
      toast.success("The inspection report has been submitted successfully");

      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit inspection",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inspection Report</CardTitle>
        <CardDescription>
          Document inspection findings and quality assessment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          <input type="hidden" name="projectId" value={projectId} />

          {/* Inspection Type */}
          <div className="space-y-2">
            <Label>Inspection Type *</Label>
            <Select
              name="type"
              required
              value={inspectionType}
              onValueChange={setInspectionType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select inspection type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="initial">Initial Inspection</SelectItem>
                <SelectItem value="progress">Progress Inspection</SelectItem>
                <SelectItem value="final">Final Inspection</SelectItem>
                <SelectItem value="special">Special Inspection</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Findings */}
          <div className="space-y-2">
            <Label>Findings *</Label>
            <Textarea
              name="findings"
              placeholder="Describe what was observed during the inspection..."
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Recommendations */}
          <div className="space-y-2">
            <Label>Recommendations</Label>
            <Textarea
              name="recommendations"
              placeholder="Any recommendations or corrective actions needed..."
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              rows={3}
            />
          </div>

          {/* Pass/Fail */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="passed"
              checked={passed}
              onCheckedChange={(checked: boolean) =>
                setPassed(checked as boolean)
              }
            />
            <Label htmlFor="passed" className="cursor-pointer">
              Inspection Passed
            </Label>
          </div>
          <input type="hidden" name="passed" value={String(passed)} />

          {/* Photos */}
          <div className="space-y-2">
            <Label>Inspection Photos</Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <input
                type="file"
                name="photos"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="inspection-photo-upload"
              />
              <label
                htmlFor="inspection-photo-upload"
                className="cursor-pointer"
              >
                <ImagePlus className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-1">
                  Click to upload inspection photos
                </p>
              </label>
            </div>

            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {photoPreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Inspection photo ${index + 1}`}
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

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Inspection Report"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
