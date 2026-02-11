import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="h-10 w-64 bg-muted animate-pulse rounded-md" />
          <div className="h-4 w-80 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-40 bg-muted animate-pulse rounded-md" />
          <div className="h-10 w-40 bg-muted animate-pulse rounded-md" />
        </div>
      </div>

      {/* Admin Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded-md" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded-md" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="h-8 w-32 bg-muted animate-pulse rounded-md" />
              <div className="h-3 w-40 bg-muted animate-pulse rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Admin Content */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <div className="h-6 w-32 bg-muted animate-pulse rounded-md mb-2" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded-md" />
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-muted animate-pulse rounded-md" />
                        <div className="h-3 w-32 bg-muted animate-pulse rounded-md" />
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="h-4 w-16 bg-muted animate-pulse rounded-md ml-auto" />
                      <div className="h-3 w-20 bg-muted animate-pulse rounded-md ml-auto" />
                    </div>
                  </div>
                ))}
             </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <div className="h-6 w-32 bg-muted animate-pulse rounded-md mb-2" />
            <div className="h-4 w-48 bg-muted animate-pulse rounded-md" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-32 bg-muted animate-pulse rounded-md" />
              <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-16 bg-muted animate-pulse rounded-md" />
              <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
            </div>
            <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
