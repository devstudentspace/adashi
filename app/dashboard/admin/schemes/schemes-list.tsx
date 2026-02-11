import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function SchemesList() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }
  
  const { data: schemes, error: schemesError } = await supabase
    .from('schemes')
    .select(`
      *,
      scheme_members(count)
    `)
    .order('created_at', { ascending: false });

  if (schemesError) {
    console.error('Error fetching schemes:', schemesError);
    return <div className="text-red-500">Failed to load schemes.</div>;
  }

  if (!schemes || schemes.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No schemes yet</h3>
        <p className="text-muted-foreground mt-2">
          Get started by creating your first savings scheme
        </p>
        <div className="mt-6">
          <Link href="/dashboard/admin/schemes/create">
            <Button>Create Scheme</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {schemes.map((scheme) => (
        <div key={scheme.id} className="border rounded-lg p-6 bg-card shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold">{scheme.name}</h2>
              <Badge variant="secondary" className="mt-2">
                {scheme.type.charAt(0).toUpperCase() + scheme.type.slice(1)}
              </Badge>
            </div>
            <Badge variant="outline">
              ₦{Number(scheme.contribution_amount).toLocaleString()} {scheme.frequency}
            </Badge>
          </div>
          
          <div className="mt-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Start:</span> {new Date(scheme.start_date).toLocaleDateString()}
            </p>
            {scheme.end_date && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">End:</span> {new Date(scheme.end_date).toLocaleDateString()}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Members:</span> {scheme.scheme_members?.[0]?.count || 0} enrolled
            </p>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href={`/dashboard/admin/schemes/${scheme.id}/assign`}>
              <Button variant="outline" size="sm">
                Assign Members
              </Button>
            </Link>
            <Link href={`/dashboard/admin/schemes/${scheme.id}/manage-status`}>
              <Button variant="outline" size="sm">
                Manage Status
              </Button>
            </Link>
            <Link href={`/dashboard/admin/schemes/${scheme.id}`}>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
