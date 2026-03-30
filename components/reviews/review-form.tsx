// components/reviews/review-form.tsx
"use client";

import { useState } from "react";
import { Star, StarHalf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createReview } from "@/actions/reviews";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ReviewFormProps = {
  projectId: string;
  projectTitle: string;
  reviewerId: string;
  revieweeId: string;
  revieweeName: string;
  revieweeType: "contractor" | "buyer";
};

export function ReviewForm({
  projectId,
  projectTitle,
  reviewerId,
  revieweeId,
  revieweeName,
  revieweeType,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [categories, setCategories] = useState({
    quality: 0,
    timeliness: 0,
    communication: 0,
    professionalism: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast("Please provide a rating before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      await createReview({
        projectId,
        reviewerId,
        revieweeId,
        rating,
        comment,
        categories,
      });
      toast.success("Your review has been submitted successfully");

      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit review",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const RatingStars = ({ value, onChange, onHover }: any) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => onHover(star)}
            onMouseLeave={() => onHover(0)}
            className="focus:outline-none"
          >
            {star <= (hoverRating || value) ? (
              <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
            ) : star - 0.5 <= (hoverRating || value) ? (
              <StarHalf className="h-6 w-6 fill-yellow-400 text-yellow-400" />
            ) : (
              <Star className="h-6 w-6 text-gray-300" />
            )}
          </button>
        ))}
      </div>
    );
  };

  const CategoryRating = ({ name, value, onChange, label }: any) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <RatingStars value={value} onChange={onChange} onHover={() => {}} />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Review {revieweeType === "contractor" ? "Contractor" : "Client"}
        </CardTitle>
        <CardDescription>
          Share your experience working with {revieweeName} on project "
          {projectTitle}"
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div className="space-y-2">
          <Label>Overall Rating *</Label>
          <RatingStars
            value={rating}
            onChange={setRating}
            onHover={setHoverRating}
          />
          {rating > 0 && (
            <p className="text-sm text-muted-foreground">
              {rating === 5 && "Excellent! Outstanding work!"}
              {rating === 4 && "Very Good! Great experience."}
              {rating === 3 && "Good. Met expectations."}
              {rating === 2 && "Fair. Needs improvement."}
              {rating === 1 && "Poor. Below expectations."}
            </p>
          )}
        </div>

        {/* Category Ratings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CategoryRating
            name="quality"
            label="Quality of Work"
            value={categories.quality}
            onChange={(value: number) =>
              setCategories({ ...categories, quality: value })
            }
          />
          <CategoryRating
            name="timeliness"
            label="Timeliness"
            value={categories.timeliness}
            onChange={(value: number) =>
              setCategories({ ...categories, timeliness: value })
            }
          />
          <CategoryRating
            name="communication"
            label="Communication"
            value={categories.communication}
            onChange={(value: number) =>
              setCategories({ ...categories, communication: value })
            }
          />
          <CategoryRating
            name="professionalism"
            label="Professionalism"
            value={categories.professionalism}
            onChange={(value: number) =>
              setCategories({ ...categories, professionalism: value })
            }
          />
        </div>

        {/* Written Review */}
        <div className="space-y-2">
          <Label>Written Review</Label>
          <Textarea
            placeholder="Share details about your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0}
          className="w-full"
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </CardContent>
    </Card>
  );
}
