import { Skeleton } from "@/components/ui/skeleton";

export function ManifestSkeleton() {
  return (
    <div className="space-y-4 w-full max-w-md">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}

export function ExecutionSkeleton() {
  return (
    <div className="p-4 space-y-2">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
