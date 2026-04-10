// components/buyer/buyer-profile-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  position: z.string().optional(),
  phone: z.string().optional(),
});

type Profile = {
  avatar_url: string | null;
  created_at: string | null;
  email: string;
  full_name: string | null;
  id: string;
  is_suspended: boolean | null;
  phone: string | null;
  suspended_at: string | null;
  updated_at: string | null;
  user_type: string | null;
};

type Buyer = {
  company_name: string | null;
  created_at: string | null;
  id: string;
  position: string | null;
  total_projects_initiated: number | null;
  updated_at: string | null;
  user_id: string;
  verified_phone: boolean | null;
};

export function BuyerProfileForm({
  profile,
  buyer,
}: {
  profile: Profile;
  buyer: Buyer;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: profile.full_name!,
      companyName: buyer.company_name || "",
      position: buyer.position || "",
      phone: profile.phone || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // Update profile
      const profileResponse = await fetch("/api/buyer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: values.fullName,
          phone: values.phone,
        }),
      });

      if (!profileResponse.ok) throw new Error("Failed to update profile");

      // Update buyer
      const buyerResponse = await fetch("/api/buyer/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: values.companyName,
          position: values.position,
        }),
      });

      if (!buyerResponse.ok) throw new Error("Failed to update buyer profile");

      toast.success("Your profile has been updated successfully");

      router.refresh();
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup className="gap-4">
        <Field data-invalid={!!form.formState.errors.fullName}>
          <FieldLabel htmlFor="buyer-full-name">Full Name</FieldLabel>
          <Input
            id="buyer-full-name"
            placeholder="Enter your full name"
            aria-invalid={!!form.formState.errors.fullName}
            {...form.register("fullName")}
          />
          <FieldError
            errors={
              form.formState.errors.fullName
                ? [{ message: form.formState.errors.fullName.message }]
                : []
            }
          />
        </Field>

        <Field data-invalid={!!form.formState.errors.companyName}>
          <FieldLabel htmlFor="buyer-company-name">Company Name</FieldLabel>
          <Input
            id="buyer-company-name"
            placeholder="Enter your company name"
            aria-invalid={!!form.formState.errors.companyName}
            {...form.register("companyName")}
          />
          <FieldDescription>
            This will be visible to contractors when you post projects
          </FieldDescription>
          <FieldError
            errors={
              form.formState.errors.companyName
                ? [{ message: form.formState.errors.companyName.message }]
                : []
            }
          />
        </Field>

        <Field data-invalid={!!form.formState.errors.position}>
          <FieldLabel htmlFor="buyer-position">Position / Title</FieldLabel>
          <Input
            id="buyer-position"
            placeholder="e.g., Project Manager, CEO"
            aria-invalid={!!form.formState.errors.position}
            {...form.register("position")}
          />
          <FieldError
            errors={
              form.formState.errors.position
                ? [{ message: form.formState.errors.position.message }]
                : []
            }
          />
        </Field>

        <Field data-invalid={!!form.formState.errors.phone}>
          <FieldLabel htmlFor="buyer-phone">Phone Number</FieldLabel>
          <Input
            id="buyer-phone"
            type="tel"
            placeholder="+63 912 345 6789"
            aria-invalid={!!form.formState.errors.phone}
            {...form.register("phone")}
          />
          <FieldDescription>
            For project communications and verification
          </FieldDescription>
          <FieldError
            errors={
              form.formState.errors.phone
                ? [{ message: form.formState.errors.phone.message }]
                : []
            }
          />
        </Field>
      </FieldGroup>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
