import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CreateProjectForm } from "@/components/projects/create-project-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, Link } from "lucide-react";
import { Button } from "@/components/ui/button";

export async function CreateProjectContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Check if user is a buyer
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single();

  if (profile?.user_type !== "buyer") {
    redirect("/");
  }

  // Check if buyer profile exists and is complete
  const { data: buyer } = await supabase
    .from("buyers")
    .select("company_name")
    .eq("user_id", user.id)
    .single();

  const isProfileComplete = buyer?.company_name && buyer.company_name !== "";

  if (!isProfileComplete) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Profile First</CardTitle>
          <CardDescription>
            You need to complete your buyer profile before creating projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Profile Required</AlertTitle>
            <AlertDescription>
              Please complete your buyer profile with your company information
              before posting projects.
            </AlertDescription>
            <Link href="/buyer/profile">
              <Button variant="outline" className="mt-4">
                Go to Profile
              </Button>
            </Link>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Project</h1>
        <p className="text-muted-foreground mt-2">
          Post your construction project and get bids from verified contractors
        </p>
      </div>

      <CreateProjectForm />
    </>
  );
}
