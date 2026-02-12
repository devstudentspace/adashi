import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { 
  Wallet, 
  History, 
  Calendar,
  Lock,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function MemberDashboard() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  // Fetch memberships with scheme details
  const { data: memberships } = await supabase
    .from('scheme_members')
    .select(`
      status,
      joined_at,
      schemes (
        id,
        name,
        type,
        contribution_amount,
        frequency
      )
    `)
    .eq('user_id', user.id);

  // Fetch recent transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(5);

  // Fetch all transactions for stats
  const { data: allTransactions } = await supabase
    .from('transactions')
    .select('amount, type')
    .eq('user_id', user.id);

  const totalSaved = allTransactions
    ?.filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

  const totalWithdrawn = allTransactions
    ?.filter(t => t.type === 'withdrawal')
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

  const availableBalance = totalSaved - totalWithdrawn;
  const activeSchemes = memberships?.filter(m => m.status === 'active') || [];
  
  const joinedDate = memberships && memberships.length > 0 
    ? new Date(Math.min(...memberships.map(m => new Date(m.joined_at).getTime())))
    : new Date();

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Savings</h1>
        <p className="text-muted-foreground">Track your contributions and scheme status.</p>
      </div>

      {/* Member Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₦{availableBalance.toLocaleString()}</div>
            <p className="text-xs opacity-70">Updated just now</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalSaved.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Since joining {joinedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Schemes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSchemes.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeSchemes.map(m => (m.schemes as any).type).join(', ')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Schemes & Recent Transactions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>My Schemes</CardTitle>
            <CardDescription>Ongoing contribution plans.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {activeSchemes.length > 0 ? (
               activeSchemes.map((m) => {
                 const scheme = m.schemes as any;
                 const Icon = scheme.type === 'ajita' ? Lock : Calendar;
                 const bgColor = scheme.type === 'ajita' ? 'bg-amber-100' : 'bg-blue-100';
                 const textColor = scheme.type === 'ajita' ? 'text-amber-600' : 'text-blue-600';
                 
                 return (
                   <Link key={scheme.id} href={`/dashboard/member/schemes/${scheme.id}`} className="block">
                     <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                           <div className={`h-10 w-10 rounded ${bgColor} flex items-center justify-center ${textColor}`}>
                              <Icon className="h-5 w-5" />
                           </div>
                           <div>
                              <p className="text-sm font-bold">{scheme.name}</p>
                              <p className="text-xs text-muted-foreground">
                                ₦{Number(scheme.contribution_amount).toLocaleString()} {scheme.frequency}
                              </p>
                           </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                     </div>
                   </Link>
                 );
               })
             ) : (
               <p className="text-sm text-muted-foreground py-4 text-center">No active schemes found.</p>
             )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent History</CardTitle>
            <CardDescription>Your last 5 transactions.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {transactions && transactions.length > 0 ? (
                  transactions.map((t) => (
                    <div key={t.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="text-sm font-medium capitalize">{t.type} {t.notes ? `- ${t.notes}` : ''}</p>
                        <p className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${t.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                          {t.type === 'deposit' ? '+' : '-'}₦{Number(t.amount).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Confirmed</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">No transactions yet.</p>
                )}
             </div>
             {transactions && transactions.length > 0 && (
               <Link href="/dashboard/member/history" className="block mt-4">
                 <Button variant="outline" className="w-full">View Full History</Button>
               </Link>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
