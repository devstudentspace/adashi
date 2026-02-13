import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function SchemeDetailsPage({ params }: Props) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/auth/login');
  }

  // Fetch scheme details
  const { data: scheme, error: schemeError } = await supabase
    .from('schemes')
    .select(`
      *,
      scheme_members (
        id,
        status,
        profiles (full_name, phone_number)
      )
    `)
    .eq('id', resolvedParams.id)
    .single();

  if (schemeError || !scheme) {
    redirect('/dashboard/admin/schemes');
  }

  // Calculate statistics
  const activeMembers = scheme.scheme_members.filter(m => m.status === 'active').length;
  const completedMembers = scheme.scheme_members.filter(m => m.status === 'completed').length;
  const defaultedMembers = scheme.scheme_members.filter(m => m.status === 'defaulted').length;

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{scheme.name}</h1>
            <div className="mt-2 flex items-center gap-4">
              <Badge variant="secondary">
                {scheme.type.charAt(0).toUpperCase() + scheme.type.slice(1)}
              </Badge>
              <Badge variant="outline">
                ₦{scheme.contribution_amount.toLocaleString()} {scheme.frequency}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Created</p>
            <p>{new Date(scheme.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 bg-card">
            <h3 className="text-sm font-medium text-muted-foreground">Total Members</h3>
            <p className="text-2xl font-bold">{scheme.scheme_members.length}</p>
          </div>
          <div className="border rounded-lg p-4 bg-card">
            <h3 className="text-sm font-medium text-muted-foreground">Active</h3>
            <p className="text-2xl font-bold text-green-600">{activeMembers}</p>
          </div>
          <div className="border rounded-lg p-4 bg-card">
            <h3 className="text-sm font-medium text-muted-foreground">Defaulted</h3>
            <p className="text-2xl font-bold text-red-600">{defaultedMembers}</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Members</h2>
          <div className="flex gap-2">
            <Link href={`/dashboard/admin/schemes/${scheme.id}/assign`}>
              <Button variant="outline">Assign Members</Button>
            </Link>
            <Link href={`/dashboard/admin/schemes/${scheme.id}/manage-status`}>
              <Button variant="outline">Manage Status</Button>
            </Link>
          </div>
        </div>

        {scheme.scheme_members.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left">Name</th>
                  <th className="py-2 text-left">Phone</th>
                  <th className="py-2 text-left">Status</th>
                  <th className="py-2 text-left">Joined</th>
                </tr>
              </thead>
              <tbody>
                {scheme.scheme_members.map((member) => (
                  <tr key={member.id} className="border-b hover:bg-muted/50">
                    <td className="py-3">{member.profiles.full_name}</td>
                    <td className="py-3">{member.profiles.phone_number}</td>
                    <td className="py-3">
                      <Badge 
                        variant={
                          member.status === 'active' 
                            ? 'default' 
                            : member.status === 'completed' 
                              ? 'secondary' 
                              : 'destructive'
                        }
                      >
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-3">
                      {new Date(member.joined_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No members assigned to this scheme yet
          </div>
        )}
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Scheme Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Start Date</p>
            <p>{new Date(scheme.start_date).toLocaleDateString()}</p>
          </div>
          {scheme.end_date && (
            <div>
              <p className="text-sm text-muted-foreground">End Date</p>
              <p>{new Date(scheme.end_date).toLocaleDateString()}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Contribution Amount</p>
            <p>₦{scheme.contribution_amount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Frequency</p>
            <p>{scheme.frequency.charAt(0).toUpperCase() + scheme.frequency.slice(1)}</p>
          </div>
        </div>
        {Object.keys(scheme.rules).length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">Rules</p>
            <pre className="bg-muted p-3 rounded-md mt-1 text-sm overflow-x-auto">
              {JSON.stringify(scheme.rules, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}