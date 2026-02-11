import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="h-10 w-48 bg-muted animate-pulse rounded-md" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="h-10 w-40 bg-muted animate-pulse rounded-md" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-6 w-32 bg-muted animate-pulse rounded-md" />
              <div className="h-4 w-48 bg-muted animate-pulse rounded-md" />
            </div>
            <div className="h-10 w-full md:w-72 bg-muted animate-pulse rounded-md" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-12 w-full bg-muted animate-pulse rounded-md" />
            <div className="h-12 w-full bg-muted animate-pulse rounded-md" />
            <div className="h-12 w-full bg-muted animate-pulse rounded-md" />
            <div className="h-12 w-full bg-muted animate-pulse rounded-md" />
            <div className="h-12 w-full bg-muted animate-pulse rounded-md" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}