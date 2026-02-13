import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import SchemesList from './schemes-list';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

function SchemesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-lg p-6 bg-card shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="h-6 w-32 bg-muted animate-pulse rounded" />
              <div className="h-5 w-20 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-6 w-24 bg-muted animate-pulse rounded" />
          </div>
          <div className="space-y-2 mt-4">
            <div className="h-4 w-40 bg-muted animate-pulse rounded" />
            <div className="h-4 w-36 bg-muted animate-pulse rounded" />
          </div>
          <div className="flex gap-2 mt-6">
            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function SchemesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Schemes</h1>
          <p className="text-muted-foreground">Manage your savings groups and contributions.</p>
        </div>
        <Link href="/dashboard/admin/schemes/create">
          <Button>Create New Scheme</Button>
        </Link>
      </div>

      <Suspense fallback={<SchemesSkeleton />}>
        <SchemesList />
      </Suspense>
    </div>
  );
}