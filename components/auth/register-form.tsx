// components/auth/register-form.tsx
"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { signup } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Building2, Home, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const formSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    userType: z.enum(["contractor", "buyer"], {
      message: "Please select an account type",
    }),
    phone: z.string().optional(),
    companyBio: z
      .string()
      .max(500, "Bio must be 500 characters or less")
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<
    "contractor" | "buyer" | null
  >(null);
  const router = useRouter();

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      phone: "",
      companyBio: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("email", values.email);
    formData.append("password", values.password);
    formData.append("fullName", values.fullName);
    formData.append("userType", values.userType);
    if (values.phone) formData.append("phone", values.phone);
    if (values.companyBio?.trim())
      formData.append("companyBio", values.companyBio.trim());

    try {
      const result = await signup(formData);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Please check your email to confirm your account.");

        // Redirect to appropriate dashboard based on user type
        if (values.userType === "contractor") {
          router.push("/dashboard/contractor/profile");
        } else {
          router.push("/dashboard/buyer/profile");
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create account",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const accountTypes = [
    {
      value: "contractor",
      title: "Contractor",
      description: "I provide construction services",
      icon: Building2,
      features: [
        "Bid on construction projects",
        "Manage ongoing projects",
        "Submit progress reports",
        "Build your reputation with reviews",
      ],
    },
    {
      value: "buyer",
      title: "Property Owner / Developer",
      description: "I need construction services",
      icon: Home,
      features: [
        "Post construction projects",
        "Find verified contractors",
        "Track project progress",
        "Manage budgets and inspections",
      ],
    },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {/* Account Type Selection */}
      <FieldSet data-invalid={!!errors.userType}>
        <FieldLegend variant="label">Account Type</FieldLegend>
        <Controller
          control={control}
          name="userType"
          render={({ field }) => (
            <RadioGroup
              onValueChange={(value) => {
                field.onChange(value);
                setSelectedType(value as "contractor" | "buyer");
              }}
              value={field.value ?? ""}
              aria-invalid={!!errors.userType}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              {accountTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.value;
                return (
                  <label
                    key={type.value}
                    className={`
                        relative flex cursor-pointer flex-col items-start gap-3 rounded-lg border p-4
                        transition-all hover:border-primary
                        ${isSelected ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-muted"}
                      `}
                  >
                    <RadioGroupItem value={type.value} className="sr-only" />
                    <div className="flex items-center gap-3">
                      <div
                        className={`
                          rounded-full p-2
                          ${isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground"}
                        `}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{type.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {type.description}
                        </p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="ml-auto h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="mt-2 flex flex-col gap-1">
                      {type.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </label>
                );
              })}
            </RadioGroup>
          )}
        />
        <FieldError errors={[errors.userType]} />
      </FieldSet>

      {/* Basic Information */}
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <p className="text-sm text-muted-foreground">
              Enter your personal details to get started
            </p>
          </div>

          <FieldGroup>
            <Field data-invalid={!!errors.fullName}>
              <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
              <FieldContent>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  aria-invalid={!!errors.fullName}
                  {...register("fullName")}
                />
                <FieldError errors={[errors.fullName]} />
              </FieldContent>
            </Field>

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <FieldContent>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                <FieldDescription>
                  We'll send you account verification and project updates
                </FieldDescription>
                <FieldError errors={[errors.email]} />
              </FieldContent>
            </Field>

            <Field data-invalid={!!errors.phone}>
              <FieldLabel htmlFor="phone">Phone Number (Optional)</FieldLabel>
              <FieldContent>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+63 912 345 6789"
                  aria-invalid={!!errors.phone}
                  {...register("phone")}
                />
                <FieldDescription>
                  For project communications and verification
                </FieldDescription>
                <FieldError errors={[errors.phone]} />
              </FieldContent>
            </Field>

            <Field data-invalid={!!errors.companyBio}>
              <FieldLabel htmlFor="companyBio">Short Bio (Optional)</FieldLabel>
              <FieldContent>
                <Textarea
                  id="companyBio"
                  placeholder="Tell us a bit about your company or project goals"
                  className="min-h-24"
                  aria-invalid={!!errors.companyBio}
                  {...register("companyBio")}
                />
                <FieldDescription>
                  This helps us personalize your experience.
                </FieldDescription>
                <FieldError errors={[errors.companyBio]} />
              </FieldContent>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Password Section */}
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold">Security</h3>
            <p className="text-sm text-muted-foreground">
              Create a strong password to protect your account
            </p>
          </div>

          <FieldGroup>
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <FieldContent>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                <FieldDescription>
                  Must be at least 8 characters with uppercase, lowercase, and
                  numbers
                </FieldDescription>
                <FieldError errors={[errors.password]} />
              </FieldContent>
            </Field>

            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel htmlFor="confirmPassword">
                Confirm Password
              </FieldLabel>
              <FieldContent>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="********"
                  aria-invalid={!!errors.confirmPassword}
                  {...register("confirmPassword")}
                />
                <FieldError errors={[errors.confirmPassword]} />
              </FieldContent>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Additional Info based on Account Type */}
      {selectedType === "contractor" && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800">
                  Contractor Registration
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  After creating your account, you'll need to complete your
                  company profile and submit verification documents. This helps
                  us ensure quality and trust on our platform.
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  You'll be guided through the verification process after
                  sign-up.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedType === "buyer" && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Home className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-800">Ready to Build</h4>
                <p className="text-sm text-green-700 mt-1">
                  Once registered, you can start posting projects and connect
                  with verified contractors. Complete your company profile to
                  get started.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <span className="mr-2">Creating account...</span>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  );
}
