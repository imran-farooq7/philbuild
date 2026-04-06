import { Suspense } from "react";
import { CreateProjectContent } from "./create-project-content";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Loading from "@/app/(dashboard)/admin/loading";

export default function CreateProjectPage() {
  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <Suspense fallback={<Loading />}>
        <CreateProjectContent />
      </Suspense>
    </div>
  );
}
