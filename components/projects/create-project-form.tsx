// components/projects/create-project-form.tsx
"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createProject } from "@/actions/project";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Please provide a detailed description"),
  budget: z.number().min(1000, "Minimum budget is ₱1,000"),
  startDate: z.date(),
  endDate: z.date(),
  address: z.string().min(5, "Please provide the project address"),
});

export function CreateProjectForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [scopeItems, setScopeItems] = useState<string[]>([]);
  const [newScopeItem, setNewScopeItem] = useState("");
  const [requirements, setRequirements] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      budget: 0,
      address: "",
    },
  });

  const addScopeItem = () => {
    if (newScopeItem.trim()) {
      setScopeItems([...scopeItems, newScopeItem.trim()]);
      setNewScopeItem("");
    }
  };

  const removeScopeItem = (index: number) => {
    setScopeItems(scopeItems.filter((_, i) => i !== index));
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setRequirements([...requirements, newRequirement.trim()]);
      setNewRequirement("");
    }
  };

  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("description", values.description);
    formData.append("budget", values.budget.toString());
    formData.append("startDate", values.startDate.toISOString());
    formData.append("endDate", values.endDate.toISOString());
    formData.append("address", values.address);
    formData.append("scope", JSON.stringify(scopeItems));
    formData.append("requirements", JSON.stringify(requirements));

    try {
      await createProject(formData);
      toast(
        "Your project has been created successfully. You can now publish it for contractors to bid.",
      );
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Failed to create project",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Provide basic information about your construction project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.title}>
              <FieldLabel htmlFor="project-title">Project Title</FieldLabel>
              <Input
                id="project-title"
                placeholder="e.g., 5-Storey Commercial Building"
                aria-invalid={!!form.formState.errors.title}
                {...form.register("title")}
              />
              <FieldDescription>
                A clear, descriptive title for your project
              </FieldDescription>
              <FieldError
                errors={
                  form.formState.errors.title
                    ? [{ message: form.formState.errors.title.message }]
                    : []
                }
              />
            </Field>

            <Field data-invalid={!!form.formState.errors.description}>
              <FieldLabel htmlFor="project-description">
                Project Description
              </FieldLabel>
              <Textarea
                id="project-description"
                placeholder="Describe the project scope, requirements, and expectations..."
                className="min-h-30"
                aria-invalid={!!form.formState.errors.description}
                {...form.register("description")}
              />
              <FieldError
                errors={
                  form.formState.errors.description
                    ? [{ message: form.formState.errors.description.message }]
                    : []
                }
              />
            </Field>
          </FieldGroup>

          <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field data-invalid={!!form.formState.errors.budget}>
              <FieldLabel htmlFor="project-budget">Budget (₱)</FieldLabel>
              <Input
                id="project-budget"
                type="number"
                placeholder="0.00"
                aria-invalid={!!form.formState.errors.budget}
                {...form.register("budget", { valueAsNumber: true })}
              />
              <FieldDescription>Estimated project budget</FieldDescription>
              <FieldError
                errors={
                  form.formState.errors.budget
                    ? [{ message: form.formState.errors.budget.message }]
                    : []
                }
              />
            </Field>

            <Field data-invalid={!!form.formState.errors.address}>
              <FieldLabel htmlFor="project-address">Project Address</FieldLabel>
              <Input
                id="project-address"
                placeholder="City, Province, Philippines"
                aria-invalid={!!form.formState.errors.address}
                {...form.register("address")}
              />
              <FieldError
                errors={
                  form.formState.errors.address
                    ? [{ message: form.formState.errors.address.message }]
                    : []
                }
              />
            </Field>
          </FieldGroup>

          <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <Field data-invalid={!!form.formState.errors.startDate}>
                  <FieldLabel>Start Date</FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                        aria-invalid={!!form.formState.errors.startDate}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FieldError
                    errors={
                      form.formState.errors.startDate
                        ? [{ message: form.formState.errors.startDate.message }]
                        : []
                    }
                  />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <Field data-invalid={!!form.formState.errors.endDate}>
                  <FieldLabel>End Date</FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                        aria-invalid={!!form.formState.errors.endDate}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < (form.getValues().startDate ?? new Date())
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FieldError
                    errors={
                      form.formState.errors.endDate
                        ? [{ message: form.formState.errors.endDate.message }]
                        : []
                    }
                  />
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Scope</CardTitle>
          <CardDescription>
            List the key deliverables and scope items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {scopeItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted rounded"
              >
                <span>{item}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeScopeItem(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                placeholder="Add scope item"
                value={newScopeItem}
                onChange={(e) => setNewScopeItem(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addScopeItem()}
              />
              <Button type="button" onClick={addScopeItem}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requirements</CardTitle>
          <CardDescription>
            List any specific requirements for contractors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {requirements.map((req, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted rounded"
              >
                <span>{req}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRequirement(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                placeholder="Add requirement"
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addRequirement()}
              />
              <Button type="button" onClick={addRequirement}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Project"}
      </Button>
    </form>
  );
}
