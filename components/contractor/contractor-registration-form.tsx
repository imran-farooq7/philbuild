// components/contractor/contractor-registration-form.tsx
"use client";

import { useState } from "react";
import {
  useForm,
  type FieldError as RHFFieldError,
  type FieldErrorsImpl,
  type FieldValues,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { submitContractorApplication } from "@/actions/contractors";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Upload } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  yearsInBusiness: z.number().min(0).max(100),
  teamSize: z.number().min(1).max(1000),
  certifications: z.array(z.string()).default([]),
  specialties: z.array(z.string()).default([]),
  previousProjects: z.array(z.string()).default([]),
  businessPermit: z.any().optional(),
  pcabLicense: z.any().optional(),
  birRegistration: z.any().optional(),
});

const AVAILABLE_CERTIFICATIONS = [
  "PCAB License",
  "ISO 9001",
  "Safety Officer Certification",
  "LEED Certification",
  "Construction Management Certification",
  "Quality Management System",
];

const AVAILABLE_SPECIALTIES = [
  "Residential Construction",
  "Commercial Construction",
  "Industrial Construction",
  "Infrastructure Projects",
  "Renovation & Remodeling",
  "Interior Design",
  "Landscape Architecture",
  "Project Management",
  "Structural Engineering",
  "Electrical Systems",
  "Plumbing Systems",
  "HVAC Systems",
];

export function ContractorRegistrationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [previousProjects, setPreviousProjects] = useState<string[]>([]);
  const [newProject, setNewProject] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as Resolver<z.infer<typeof formSchema>>,
    defaultValues: {
      companyName: "",
      yearsInBusiness: 0,
      teamSize: 1,
      certifications: [],
      specialties: [],
      previousProjects: [],
    },
  });

  const {
    formState: { errors },
    register,
  } = form;

  const getErrorMessage = (
    error?:
      | RHFFieldError
      | RHFFieldError[]
      | FieldErrorsImpl<FieldValues>,
  ): string | undefined => {
    if (!error) return undefined;
    if (Array.isArray(error)) {
      return error[0]?.message;
    }
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
    return undefined;
  };

  const businessPermitMessage = getErrorMessage(errors.businessPermit);
  const pcabLicenseMessage = getErrorMessage(errors.pcabLicense);
  const birRegistrationMessage = getErrorMessage(errors.birRegistration);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    const formData = new FormData();
    formData.append("companyName", values.companyName);
    formData.append("yearsInBusiness", values.yearsInBusiness.toString());
    formData.append("teamSize", values.teamSize.toString());
    formData.append("certifications", JSON.stringify(certifications));
    formData.append("specialties", JSON.stringify(specialties));
    formData.append("previousProjects", JSON.stringify(previousProjects));

    if (values.businessPermit) {
      formData.append("businessPermit", values.businessPermit[0]);
    }
    if (values.pcabLicense) {
      formData.append("pcabLicense", values.pcabLicense[0]);
    }
    if (values.birRegistration) {
      formData.append("birRegistration", values.birRegistration[0]);
    }

    try {
      await submitContractorApplication(formData);
      toast("Application Submitted", {
        description:
          "Your application is being reviewed. You will be notified once verified.",
      });
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to submit application",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const addCertification = (cert: string) => {
    if (!certifications.includes(cert)) {
      const newCerts = [...certifications, cert];
      setCertifications(newCerts);
      form.setValue("certifications", newCerts);
    }
  };

  const removeCertification = (cert: string) => {
    const newCerts = certifications.filter((c) => c !== cert);
    setCertifications(newCerts);
    form.setValue("certifications", newCerts);
  };

  const addSpecialty = (specialty: string) => {
    if (!specialties.includes(specialty)) {
      const newSpecialties = [...specialties, specialty];
      setSpecialties(newSpecialties);
      form.setValue("specialties", newSpecialties);
    }
  };

  const removeSpecialty = (specialty: string) => {
    const newSpecialties = specialties.filter((s) => s !== specialty);
    setSpecialties(newSpecialties);
    form.setValue("specialties", newSpecialties);
  };

  const addPreviousProject = () => {
    if (newProject.trim()) {
      const newProjects = [...previousProjects, newProject.trim()];
      setPreviousProjects(newProjects);
      form.setValue("previousProjects", newProjects);
      setNewProject("");
    }
  };

  const removePreviousProject = (project: string) => {
    const newProjects = previousProjects.filter((p) => p !== project);
    setPreviousProjects(newProjects);
    form.setValue("previousProjects", newProjects);
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-8"
    >
      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Provide your basic company details</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <FieldGroup>
            <Field data-invalid={!!errors.companyName}>
              <FieldLabel htmlFor="company-name">Company Name *</FieldLabel>
              <Input
                id="company-name"
                placeholder="e.g., ABC Construction Corp."
                aria-invalid={!!errors.companyName}
                {...register("companyName")}
              />
              <FieldError
                errors={
                  errors.companyName
                    ? [{ message: errors.companyName.message }]
                    : []
                }
              />
            </Field>
          </FieldGroup>
          <FieldGroup className="grid grid-cols-2 gap-4">
            <Field data-invalid={!!errors.yearsInBusiness}>
              <FieldLabel htmlFor="years-in-business">
                Years in Business
              </FieldLabel>
              <Input
                id="years-in-business"
                type="number"
                aria-invalid={!!errors.yearsInBusiness}
                {...register("yearsInBusiness", { valueAsNumber: true })}
              />
              <FieldError
                errors={
                  errors.yearsInBusiness
                    ? [{ message: errors.yearsInBusiness.message }]
                    : []
                }
              />
            </Field>
            <Field data-invalid={!!errors.teamSize}>
              <FieldLabel htmlFor="team-size">Team Size</FieldLabel>
              <Input
                id="team-size"
                type="number"
                aria-invalid={!!errors.teamSize}
                {...register("teamSize", { valueAsNumber: true })}
              />
              <FieldError
                errors={
                  errors.teamSize ? [{ message: errors.teamSize.message }] : []
                }
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader>
          <CardTitle>Certifications</CardTitle>
          <CardDescription>Select your company certifications</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {certifications.map((cert) => (
              <div key={cert} className="flex items-center gap-2">
                <Badge variant="secondary">{cert}</Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCertification(cert)}
                  aria-label={`Remove ${cert}`}
                >
                  <X data-icon="inline-start" />
                </Button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {AVAILABLE_CERTIFICATIONS.filter(
              (c) => !certifications.includes(c),
            ).map((cert) => (
              <Button
                key={cert}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addCertification(cert)}
              >
                <Plus data-icon="inline-start" />
                {cert}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Specialties */}
      <Card>
        <CardHeader>
          <CardTitle>Specialties</CardTitle>
          <CardDescription>
            What type of projects do you specialize in?
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {specialties.map((specialty) => (
              <div key={specialty} className="flex items-center gap-2">
                <Badge variant="secondary">{specialty}</Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSpecialty(specialty)}
                  aria-label={`Remove ${specialty}`}
                >
                  <X data-icon="inline-start" />
                </Button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {AVAILABLE_SPECIALTIES.filter((s) => !specialties.includes(s)).map(
              (specialty) => (
                <Button
                  key={specialty}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addSpecialty(specialty)}
                >
                  <Plus data-icon="inline-start" />
                  {specialty}
                </Button>
              ),
            )}
          </div>
        </CardContent>
      </Card>

      {/* Previous Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Previous Projects</CardTitle>
          <CardDescription>
            List your notable completed projects
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            {previousProjects.map((project) => (
              <div
                key={project}
                className="flex items-center justify-between rounded bg-muted p-2"
              >
                <span>{project}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removePreviousProject(project)}
                  aria-label={`Remove ${project}`}
                >
                  <X data-icon="inline-start" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Project name"
              value={newProject}
              onChange={(e) => setNewProject(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addPreviousProject();
                }
              }}
            />
            <Button type="button" onClick={addPreviousProject}>
              <Plus data-icon="inline-start" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Document Uploads */}
      <Card>
        <CardHeader>
          <CardTitle>Required Documents</CardTitle>
          <CardDescription>
            Upload your business permits and licenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="flex flex-col gap-4">
            <Field data-invalid={!!errors.businessPermit}>
              <FieldLabel htmlFor="business-permit">Business Permit</FieldLabel>
              <div className="flex items-center gap-2">
                <Input
                  id="business-permit"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  aria-invalid={!!errors.businessPermit}
                  {...register("businessPermit")}
                />
                <Upload aria-hidden="true" className="text-muted-foreground" />
              </div>
              <FieldDescription>
                Upload your valid business permit
              </FieldDescription>
              <FieldError
                errors={
                  businessPermitMessage ? [{ message: businessPermitMessage }] : []
                }
              />
            </Field>
            <Field data-invalid={!!errors.pcabLicense}>
              <FieldLabel htmlFor="pcab-license">PCAB License</FieldLabel>
              <div className="flex items-center gap-2">
                <Input
                  id="pcab-license"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  aria-invalid={!!errors.pcabLicense}
                  {...register("pcabLicense")}
                />
                <Upload aria-hidden="true" className="text-muted-foreground" />
              </div>
              <FieldDescription>
                Philippine Contractors Accreditation Board License
              </FieldDescription>
              <FieldError
                errors={
                  pcabLicenseMessage ? [{ message: pcabLicenseMessage }] : []
                }
              />
            </Field>
            <Field data-invalid={!!errors.birRegistration}>
              <FieldLabel htmlFor="bir-registration">
                BIR Registration
              </FieldLabel>
              <div className="flex items-center gap-2">
                <Input
                  id="bir-registration"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  aria-invalid={!!errors.birRegistration}
                  {...register("birRegistration")}
                />
                <Upload aria-hidden="true" className="text-muted-foreground" />
              </div>
              <FieldDescription>
                Certificate of Registration from BIR
              </FieldDescription>
              <FieldError
                errors={
                  birRegistrationMessage
                    ? [{ message: birRegistrationMessage }]
                    : []
                }
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Submitting..." : "Submit Application"}
      </Button>
    </form>
  );
}
