import { createClient, createAdminClient } from "@/lib/supabase/server";
import { 
  Users, 
  Wallet, 
  TrendingUp, 
  Plus, 
  Search,
  LayoutDashboard,
  CreditCard,
  Settings,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { format } from "date-fns";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  // Fetch real counts
  const { count: memberCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'member');

  // Fetch recent transactions
  const { data: recentTransactions } = await adminClient
    .from('transactions')
    .select(`
      *,
      profiles:user_id (full_name),
      schemes:scheme_id (name)
    `)
    .order('date', { ascending: false })
    .limit(5);

  // Calculate total portfolio (sum of all deposits minus sum of all payouts)
  const { data: allTransactions } = await adminClient
    .from('transactions')
    .select('amount, type');

  const totalPortfolio = allTransactions?.reduce((acc, t) => {
    if (t.type === 'deposit') return acc + Number(t.amount);
    if (t.type === 'withdrawal') return acc - Number(t.amount);
    return acc;
  }, 0) || 0;

  // Calculate today's collection
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { data: todayDeposits } = await adminClient
    .from('transactions')
    .select('amount')
    .eq('type', 'deposit')
    .gte('date', today.toISOString());
  
  const dailyCollection = todayDeposits?.reduce((acc, t) => acc + Number(t.amount), 0) || 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manager Ledger</h1>
          <p className="text-muted-foreground">Manage your schemes, members, and collections.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/admin/members">
            <Button variant="outline">
               <Search className="mr-2 h-4 w-4" /> Search Member
            </Button>
          </Link>
          <Link href="/dashboard/admin/schemes/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Scheme
            </Button>
          </Link>
        </div>
      </div>

      {/* Admin Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalPortfolio.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all active schemes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Collection</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{dailyCollection.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Collected today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberCount || 0}</div>
            <p className="text-xs text-muted-foreground">Registered customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System History</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground">System online</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Admin Content */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest entries across all active schemes.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {recentTransactions && recentTransactions.length > 0 ? (
                  recentTransactions.map((t) => (
                    <div key={t.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {(t.profiles as any)?.full_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{(t.profiles as any)?.full_name || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">{(t.schemes as any)?.name || 'General'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-sm font-bold",
                          t.type === 'deposit' ? "text-green-600" : (t.type === 'withdrawal' ? "text-orange-600" : "text-foreground")
                        )}>
                          {t.type === 'deposit' ? '+' : '-'}₦{Number(t.amount).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">{format(new Date(t.date), 'h:mm a')}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No recent transactions.</div>
                )}
             </div>
             <Link href="/dashboard/admin/transactions">
               <Button variant="link" className="mt-4 w-full">View Full Ledger</Button>
             </Link>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Record</CardTitle>
            <CardDescription>Enter a new daily payment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Member Phone / Name</label>
              <Input placeholder="Search member..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <Input type="number" placeholder="1000" />
            </div>
            <Button className="w-full">Save Transaction</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
