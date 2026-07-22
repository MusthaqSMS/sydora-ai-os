import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-5">
      <div><Skeleton className="h-8 w-64" /><Skeleton className="mt-2 h-4 w-96 max-w-full" /></div>
      <Skeleton className="h-20" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">{Array.from({ length: 14 }, (_, index) => <Skeleton className="h-28" key={index} />)}</div>
      <div className="grid gap-4 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <Skeleton className="h-72" key={index} />)}</div>
    </div>
  );
}
