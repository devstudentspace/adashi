import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, Wallet } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function TransactionHistoryPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      *,
      schemes (name)
    `)
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/member">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transaction History</h1>
          <p className="text-sm text-muted-foreground">All your deposits and payouts.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="py-3 px-4 text-left font-medium">Date</th>
                  <th className="py-3 px-4 text-left font-medium">Scheme</th>
                  <th className="py-3 px-4 text-left font-medium">Type</th>
                  <th className="py-3 px-4 text-left font-medium">Notes</th>
                  <th className="py-3 px-4 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions && transactions.length > 0 ? (
                  transactions.map((t) => (
                    <tr key={t.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="py-4 px-4 text-sm whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString(undefined, { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-4 px-4 text-sm">
                        {(t.schemes as any)?.name || 'General'}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={t.type === 'deposit' ? 'default' : 'secondary'} className="capitalize">
                          {t.type}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        {t.notes || '-'}
                      </td>
                      <td className={`py-4 px-4 text-right text-sm font-bold ${t.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'deposit' ? '+' : '-'}₦{Number(t.amount).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
