import { createClient } from "@/lib/supabase/server";
import { QuickRecordForm } from "@/components/quick-record-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CollectPage({ params }: Props) {
  const resolvedParams = await params;
  const supabase = await createClient();

  // Fetch scheme details
  const { data: scheme, error: schemeError } = await supabase
    .from('schemes')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  if (schemeError || !scheme) {
    return <div className="text-red-500">Scheme not found</div>;
  }

  // Fetch scheme members with their profiles
  const { data: schemeMembers, error: membersError } = await supabase
    .from('scheme_members')
    .select(`
      *,
      profiles:user_id (
        id,
        full_name,
        phone_number
      )
    `)
    .eq('scheme_id', resolvedParams.id)
    .eq('status', 'active')
    .order('joined_at');

  if (membersError) {
    console.error('Error fetching members:', membersError);
    return <div className="text-red-500">Failed to load members</div>;
  }

  // Get today's contributions to mark who has already paid
  const today = new Date().toISOString().split('T')[0];
  const { data: todayContributions } = await supabase
    .from('transactions')
    .select('user_id')
    .eq('scheme_id', resolvedParams.id)
    .eq('type', 'deposit')
    .gte('date', `${today}T00:00:00`)
    .lt('date', `${today}T23:59:59`);

  const paidTodayUserIds = new Set(todayContributions?.map(t => t.user_id) || []);

  const totalMembers = schemeMembers?.length || 0;
  const paidToday = paidTodayUserIds.size;
  const pendingToday = totalMembers - paidToday;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/admin/schemes/${resolvedParams.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Scheme
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Daily Collection</h1>
          <p className="text-muted-foreground">{scheme.name}</p>
        </div>
      </div>

      {/* Collection Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{paidToday}</div>
            <p className="text-sm text-muted-foreground">Paid Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{pendingToday}</div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{totalMembers}</div>
            <p className="text-sm text-muted-foreground">Total Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">₦{(paidToday * scheme.contribution_amount).toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Collected Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Collection Interface */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Member Collection</h2>
          <Badge variant="outline">
            ₦{scheme.contribution_amount.toLocaleString()} {scheme.frequency}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schemeMembers?.map((member) => (
            <QuickRecordForm
              key={member.id}
              member={{
                id: member.profiles.id,
                full_name: member.profiles.full_name,
                phone_number: member.profiles.phone_number
              }}
              scheme={scheme}
              hasContributedToday={paidTodayUserIds.has(member.profiles.id)}
            />
          ))}
        </div>

        {(!schemeMembers || schemeMembers.length === 0) && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No active members in this scheme.</p>
              <Link href={`/dashboard/admin/schemes/${resolvedParams.id}/assign`}>
                <Button className="mt-4">Assign Members</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}