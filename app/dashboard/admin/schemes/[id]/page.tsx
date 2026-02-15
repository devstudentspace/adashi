import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuickRecordButton } from '@/components/quick-record-button-client';
import { SchemeLedger } from '@/components/scheme-ledger';

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
        user_id,
        status,
        joined_at,
        profiles (full_name, phone_number)
      )
    `)
    .eq('id', resolvedParams.id)
    .single();

  if (schemeError || !scheme) {
    redirect('/dashboard/admin/schemes');
  }

  // Fetch recent transactions for this scheme (only for active cycles)
  // To correctly filter for current cycles of all members, we need to consider their individual joined_at dates.
  // Since we fetch transactions for the whole scheme, we'll fetch them all and then filter in memory
  // based on the joined_at dates we already have from the scheme_members join above.
  const { data: allTransactions } = await supabase
    .from('transactions')
    .select(`
      id,
      amount,
      type,
      date,
      notes,
      user_id,
      profiles (full_name)
    `)
    .eq('scheme_id', resolvedParams.id)
    .order('date', { ascending: false })
    .limit(300); // Fetch more to allow for filtering

  // Map user_id to joined_at for quick lookup
  const userJoinDates = new Map(
    scheme.scheme_members.map((m: any) => [m.user_id, new Date(m.joined_at)])
  );

  // Filter transactions: only show if date >= member's joined_at
  const transactions = allTransactions?.filter(t => {
    const joinDate = userJoinDates.get(t.user_id);
    if (!joinDate) return false; // Not a current member of the scheme
    return new Date(t.date) >= joinDate;
  }) || [];

  // Identify who paid today (using the filtered transactions)
  const today = new Date();
  // Create a date object for today at the start of the day for comparison
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  
  const paidTodayUserIds = new Set(
    transactions
      ?.filter(t => {
        // Parse the transaction date and check if it falls within today
        const transactionDate = new Date(t.date);
        return t.type === 'deposit' && 
               transactionDate >= startOfToday && 
               transactionDate < endOfToday;
      })
      .map(t => t.user_id) || []
  );

  // Calculate statistics
  const activeMembers = scheme.scheme_members.filter((m: any) => m.status === 'active').length;
  const completedMembers = scheme.scheme_members.filter((m: any) => m.status === 'completed').length;
  const defaultedMembers = scheme.scheme_members.filter((m: any) => m.status === 'defaulted').length;

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Members</h2>
              <div className="flex gap-2">
                <Link href={`/dashboard/admin/schemes/${scheme.id}/collect`}>
                  <Button size="sm">Daily Collection</Button>
                </Link>
                <Link href={`/dashboard/admin/schemes/${scheme.id}/assign`}>
                  <Button variant="outline" size="sm">Assign Members</Button>
                </Link>
                <Link href={`/dashboard/admin/schemes/${scheme.id}/manage-status`}>
                  <Button variant="outline" size="sm">Manage Status</Button>
                </Link>
              </div>
            </div>

            {scheme.scheme_members.length > 0 ? (
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-2 px-4 text-left">Name</th>
                      <th className="py-2 px-4 text-left">Phone</th>
                      <th className="py-2 px-4 text-left">Status</th>
                      <th className="py-2 px-4 text-left">Quick Collect</th>
                      <th className="py-2 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheme.scheme_members.map((member: any) => (
                      <tr key={member.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{member.profiles.full_name}</td>
                        <td className="py-3 px-4">{member.profiles.phone_number}</td>
                        <td className="py-3 px-4">
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
                        <td className="py-3 px-4">
                          {member.status === 'active' && (
                            <QuickRecordButton
                              userId={member.user_id}
                              schemeId={scheme.id}
                              amount={scheme.contribution_amount}
                              userName={member.profiles.full_name}
                            />
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Link href={`/dashboard/admin/schemes/${scheme.id}/member/${member.user_id}`}>
                            <Button variant="ghost" size="sm">View Card</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border rounded-lg">
                No members assigned to this scheme yet
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="mb-8">
            <SchemeLedger transactions={transactions || []} />
          </div>

          <div className="border rounded-lg p-6 bg-card">
            <h3 className="text-lg font-medium mb-4">Scheme Info</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium">{new Date(scheme.start_date).toLocaleDateString()}</p>
              </div>
              {scheme.end_date && (
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-medium">{new Date(scheme.end_date).toLocaleDateString()}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Contribution Amount</p>
                <p className="font-medium">₦{scheme.contribution_amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Frequency</p>
                <p className="font-medium capitalize">{scheme.frequency}</p>
              </div>
            </div>
            {(scheme.description || Object.keys(scheme.rules).length > 0) && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-muted-foreground mb-2">Description & Rules</p>
                {scheme.description && (
                  <div className="mb-4 p-3 bg-muted rounded-md">
                    <p className="whitespace-pre-wrap">{scheme.description}</p>
                  </div>
                )}
                {Object.keys(scheme.rules).length > 0 && (
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                    {JSON.stringify(scheme.rules, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
