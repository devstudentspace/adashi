import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <div className="h-8 w-48 bg-muted animate-pulse rounded-md mb-2" />
        <div className="h-4 w-64 bg-muted animate-pulse rounded-md" />
      </div>

      <Card>
        <CardHeader>
          <div className="h-6 w-32 bg-muted animate-pulse rounded-md" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
             <div className="h-20 w-20 rounded-full bg-muted animate-pulse" />
             <div className="space-y-2">
                <div className="h-4 w-32 bg-muted animate-pulse rounded-md" />
                <div className="h-10 w-48 bg-muted animate-pulse rounded-md" />
             </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded-md" />
                <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
