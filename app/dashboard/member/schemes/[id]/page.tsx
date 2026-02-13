import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, Calendar, Lock, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContributionCard } from "@/components/contribution-card";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function MemberSchemeDetailsPage({ params }: Props) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  // Fetch scheme details and the member's specific membership
  const { data: scheme, error: schemeError } = await supabase
    .from('schemes')
    .select(`
      *,
      scheme_members (
        user_id,
        status,
        payout_order,
        joined_at,
        profiles (full_name)
      )
    `)
    .eq('id', resolvedParams.id)
    .single();

  if (schemeError || !scheme) {
    redirect("/dashboard/member");
  }

  const myMembership = scheme.scheme_members.find((m: any) => m.user_id === user.id);
  const Icon = scheme.type === 'ajita' ? Lock : Calendar;

  // Fetch transactions for THIS user in THIS scheme (only since they joined this session)
  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, date, type')
    .eq('scheme_id', resolvedParams.id)
    .eq('user_id', user.id)
    .gte('date', myMembership?.joined_at || scheme.start_date);

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex items-center gap-2 sm:gap-4 px-4 sm:px-0 mt-2 sm:mt-0">
        <Link href="/dashboard/member">
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{scheme.name}</h1>
          <p className="text-[10px] sm:text-sm text-muted-foreground capitalize">{scheme.type} Scheme</p>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4 sm:space-y-6">
          <Card className="rounded-none sm:rounded-xl border-x-0 sm:border-x">
            <CardHeader className="py-4 px-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg">Scheme Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6 pb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] sm:text-sm text-muted-foreground uppercase font-bold tracking-wider">Contribution</p>
                  <p className="text-base sm:text-lg font-black text-primary">₦{Number(scheme.contribution_amount).toLocaleString()}</p>
                  <p className="text-[9px] sm:text-xs text-muted-foreground capitalize">{scheme.frequency} frequency</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-sm text-muted-foreground uppercase font-bold tracking-wider">Status</p>
                  <Badge className="mt-1 text-[10px] sm:text-xs font-black px-2 py-0">
                    {myMembership?.status || 'Active'}
                  </Badge>
                </div>
              </div>

              {scheme.type === 'kwanta' && (
                 <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <h3 className="text-[10px] sm:text-xs font-black text-blue-800 uppercase mb-1">Kwanta Turn</h3>
                    <p className="text-xs sm:text-sm text-blue-700 font-bold">
                      Your payout position: <span className="text-blue-900">#{myMembership?.payout_order || 'N/A'}</span>
                    </p>
                 </div>
              )}
            </CardContent>
          </Card>

          <ContributionCard 
            transactions={transactions || []}
            contributionAmount={scheme.contribution_amount}
            frequency={scheme.frequency}
            startDate={myMembership?.joined_at || scheme.start_date}
          />
        </div>

        <Card className="rounded-none sm:rounded-xl border-x-0 sm:border-x">
          <CardHeader className="py-4 px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg">Participants</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-6">
            <div className="space-y-3">
              {scheme.scheme_members.map((m: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 py-1 border-b border-muted last:border-0">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold truncate text-foreground">{m.profiles?.full_name}</p>
                    {scheme.type === 'kwanta' && (
                      <p className="text-[9px] sm:text-xs text-muted-foreground">Turn #{m.payout_order}</p>
                    )}
                  </div>
                  {m.status === 'completed' && (
                    <Badge variant="secondary" className="text-[8px] sm:text-[10px] px-1 font-black">Paid</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
