import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminMemberCard } from "@/components/admin-member-card";
import { SchemeLedger } from "@/components/scheme-ledger";
import { MemberBalanceCard } from "@/components/member-balance-card";

interface Props {
  params: Promise<{
    id: string;
    userId: string;
  }>;
}

export default async function AdminMemberDetailsPage({ params }: Props) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: { user: adminUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !adminUser) {
    redirect("/auth/login");
  }

  // Fetch scheme details and the specific member's profile
  const { data: scheme } = await supabase
    .from('schemes')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  const { data: memberProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', resolvedParams.userId)
    .single();

  const { data: membership } = await supabase
    .from('scheme_members')
    .select('*')
    .eq('scheme_id', resolvedParams.id)
    .eq('user_id', resolvedParams.userId)
    .single();

  if (!scheme || !memberProfile || !membership) {
    redirect(`/dashboard/admin/schemes/${resolvedParams.id}`);
  }

  // Fetch transactions for ContributionCard (only since they joined this session)
  const { data: contributionTransactions } = await supabase
    .from('transactions')
    .select('amount, date, type')
    .eq('scheme_id', resolvedParams.id)
    .eq('user_id', resolvedParams.userId)
    .gte('date', membership.joined_at)
    .order('date', { ascending: false });

  // Fetch full transaction data for SchemeLedger (only since they joined this session)
  const { data: fullTransactions } = await supabase
    .from('transactions')
    .select(`
      id,
      amount,
      type,
      date,
      notes,
      profiles (full_name)
    `)
    .eq('scheme_id', resolvedParams.id)
    .eq('user_id', resolvedParams.userId)
    .gte('date', membership.joined_at)
    .order('date', { ascending: false });

  return (
    <div className="flex flex-col gap-4 sm:gap-6 py-4 sm:py-10">
      <div className="flex items-center gap-2 sm:gap-4 px-4 sm:px-0">
        <Link href={`/dashboard/admin/schemes/${scheme.id}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight truncate">{memberProfile.full_name}'s Card</h1>
          <p className="text-[10px] sm:text-sm text-muted-foreground font-bold">{scheme.name}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4 sm:space-y-6">
          <AdminMemberCard
            userId={resolvedParams.userId}
            schemeId={scheme.id}
            amount={Number(scheme.contribution_amount)}
            transactions={contributionTransactions || []}
            startDate={membership.joined_at}
            frequency={scheme.frequency}
          />

          <div className="px-4 sm:px-0">
            <SchemeLedger transactions={fullTransactions || []} />
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <MemberBalanceCard
            userId={resolvedParams.userId}
            schemeId={scheme.id}
            memberName={memberProfile.full_name}
            memberPhone={memberProfile.phone_number}
            schemeType={scheme.type}
            joinedAt={membership.joined_at}
          />

          <Card className="rounded-none sm:rounded-xl border-x-0 sm:border-x shadow-none sm:shadow-md">
            <CardHeader className="py-4 px-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg">Member Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6 pb-6">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <User className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0">
                  <p className="font-black text-sm sm:text-base truncate">{memberProfile.full_name}</p>
                  <p className="text-[10px] sm:text-sm text-muted-foreground font-bold">{memberProfile.phone_number}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground font-black uppercase tracking-widest">Status</p>
                  <Badge className="mt-1 text-[10px] sm:text-xs font-black">{membership.status}</Badge>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground font-black uppercase tracking-widest">Joined</p>
                  <p className="text-xs sm:text-sm font-bold">{new Date(membership.joined_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
