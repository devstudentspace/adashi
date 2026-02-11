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
      </div>

      {/* Member Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
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

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="h-6 w-32 bg-muted animate-pulse rounded-md mb-2" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded-md" />
        </CardHeader>
        <CardContent>
           <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
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
    </div>
  );
}
