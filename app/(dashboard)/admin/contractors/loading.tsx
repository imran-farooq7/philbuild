import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <div className="h-9 w-64">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="mt-2 h-5 w-80">
          <Skeleton className="h-full w-full" />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="h-10 w-72">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="rounded-lg border p-6">
          <div className="mb-4 h-6 w-56">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="mb-6 h-4 w-96">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
