import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { 
  Users, 
  Wallet, 
  TrendingUp, 
  Plus, 
  Search,
  LayoutDashboard,
  CreditCard,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // Fetch real counts
  const { count: memberCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'member');

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manager Ledger</h1>
          <p className="text-muted-foreground">Manage your schemes, members, and collections.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
             <Search className="mr-2 h-4 w-4" /> Search Member
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Scheme
          </Button>
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
            <div className="text-2xl font-bold">₦1,240,000</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Collection</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦45,500</div>
            <p className="text-xs text-muted-foreground">Target: ₦50,000</p>
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
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Syncing</div>
            <p className="text-xs text-muted-foreground">All data backed up</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Admin Content */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Deposits</CardTitle>
            <CardDescription>Latest entries across all active schemes.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {[1,2,3].map((i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-bold">
                        {String.fromCharCode(64 + i)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">Member {i}</p>
                        <p className="text-xs text-muted-foreground">Akawo Daily Contribution</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">+₦1,000</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                ))}
             </div>
             <Button variant="link" className="mt-4 w-full">View Full Ledger</Button>
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
