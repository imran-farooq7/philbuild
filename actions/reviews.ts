// app/actions/reviews.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notifications";

export type ReviewData = {
  projectId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  categories: {
    quality: number;
    timeliness: number;
    communication: number;
    professionalism: number;
  };
};

export async function createReview(data: ReviewData) {
  const supabase = await createClient();

  // Check if review already exists
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("project_id", data.projectId)
    .eq("reviewer_id", data.reviewerId)
    .single();

  if (existingReview) {
    throw new Error("You have already reviewed this project");
  }

  // Create review
  const { data: review, error } = await supabase
    .from("reviews")
    .insert({
      project_id: data.projectId,
      reviewer_id: data.reviewerId,
      reviewee_id: data.revieweeId,
      rating: data.rating,
      comment: data.comment,
      categories: data.categories,
    })
    .select()
    .single();

  if (error) throw error;

  // Update contractor average rating if reviewee is contractor
  const { data: reviewee } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", data.revieweeId)
    .single();

  if (reviewee?.user_type === "contractor") {
    // Get all reviews for this contractor
    const { data: reviews } = await supabase
      .from("reviews")
      .select("rating")
      .eq("reviewee_id", data.revieweeId);

    if (reviews && reviews.length > 0) {
      const avgRating =
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

      await supabase
        .from("contractors")
        .update({ average_rating: avgRating })
        .eq("user_id", data.revieweeId);
    }
  }

  // Create notification for reviewee
  const { data: project } = await supabase
    .from("projects")
    .select("title")
    .eq("id", data.projectId)
    .single();

  await createNotification(
    data.revieweeId,
    "review",
    "New Review Received",
    `${data.revieweeId === data.reviewerId ? "You" : "Someone"} left a ${data.rating}-star review on project "${project?.title}"`,
    { projectId: data.projectId, rating: data.rating },
  );

  revalidatePath(`/dashboard/projects/${data.projectId}`);
  revalidatePath(`/dashboard/contractor/${data.revieweeId}/reviews`);

  return review;
}

export async function getReviewsForUser(
  userId: string,
  limit: number = 10,
  offset: number = 0,
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      *,
      project:projects (title),
      reviewer:profiles!reviews_reviewer_id_fkey (full_name, avatar_url)
    `,
    )
    .eq("reviewee_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data;
}

export async function getContractorRating(contractorId: string) {
  const supabase = await createClient();

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("rating, categories")
    .eq("reviewee_id", contractorId);

  if (error) throw error;

  if (!reviews || reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      categories: {
        quality: 0,
        timeliness: 0,
        communication: 0,
        professionalism: 0,
      },
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const averageRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  // Calculate category averages
  const categorySums = reviews.reduce(
    (sums, review) => {
      sums.quality += getCategoryNumber(review.categories, "quality");
      sums.timeliness += getCategoryNumber(review.categories, "timeliness");
      sums.communication += getCategoryNumber(review.categories, "communication");
      sums.professionalism += getCategoryNumber(
        review.categories,
        "professionalism",
      );
      return sums;
    },
    { quality: 0, timeliness: 0, communication: 0, professionalism: 0 },
  );

  // Calculate rating distribution
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((review) => {
    distribution[review.rating as keyof typeof distribution]++;
  });

  return {
    averageRating: parseFloat(averageRating.toFixed(1)),
    totalReviews: reviews.length,
    categories: {
      quality: parseFloat((categorySums.quality / reviews.length).toFixed(1)),
      timeliness: parseFloat(
        (categorySums.timeliness / reviews.length).toFixed(1),
      ),
      communication: parseFloat(
        (categorySums.communication / reviews.length).toFixed(1),
      ),
      professionalism: parseFloat(
        (categorySums.professionalism / reviews.length).toFixed(1),
      ),
    },
    distribution,
  };
}

type ReviewCategoryKey =
  | "quality"
  | "timeliness"
  | "communication"
  | "professionalism";

function getCategoryNumber(
  categories: unknown,
  key: ReviewCategoryKey,
): number {
  if (!categories || typeof categories !== "object" || Array.isArray(categories)) {
    return 0;
  }

  const value = (categories as Record<string, unknown>)[key];
  return typeof value === "number" ? value : 0;
}
