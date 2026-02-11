import { redirect } from "next/navigation";
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
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

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
            <div className="text-3xl font-bold">₦42,000</div>
            <p className="text-xs opacity-70">Next payout: Feb 28, 2026</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦150,000</div>
            <p className="text-xs text-muted-foreground">Since joining Jan 2025</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Schemes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">1 Akawo, 1 Ajita</p>
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
             <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center text-blue-600">
                      <Calendar className="h-5 w-5" />
                   </div>
                   <div>
                      <p className="text-sm font-bold">Daily Market Akawo</p>
                      <p className="text-xs text-muted-foreground">₦1,000 daily</p>
                   </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
             </div>
             <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded bg-amber-100 flex items-center justify-center text-amber-600">
                      <Lock className="h-5 w-5" />
                   </div>
                   <div>
                      <p className="text-sm font-bold">Sallah Ajita 2026</p>
                      <p className="text-xs text-muted-foreground">Locked until Eid-ul-Adha</p>
                   </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
             </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent History</CardTitle>
            <CardDescription>Your last 5 deposits.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {[1,2,3].map((i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium">Daily Deposit</p>
                      <p className="text-xs text-muted-foreground">Feb {10-i}, 2026</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">+₦1,000</p>
                      <p className="text-xs text-muted-foreground">Confirmed</p>
                    </div>
                  </div>
                ))}
             </div>
             <Button variant="outline" className="mt-4 w-full">View Full History</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
