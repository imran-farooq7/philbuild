export function ProjectsPageFallback() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-40 rounded bg-muted animate-pulse" />
          <div className="h-4 w-80 rounded bg-muted animate-pulse" />
        </div>
        <div className="h-10 w-36 rounded bg-muted animate-pulse" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-36 rounded border bg-muted/40 animate-pulse" />
        <div className="h-36 rounded border bg-muted/40 animate-pulse" />
        <div className="h-36 rounded border bg-muted/40 animate-pulse" />
      </div>
    </div>
  );
}
