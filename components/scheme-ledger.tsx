'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  date: string;
  notes: string;
  profiles: any; // Handle Supabase returning either object or array for joined profiles
}

interface SchemeLedgerProps {
  transactions: any[]; // Using any[] here to be more flexible with Supabase results
}

export function SchemeLedger({ transactions }: SchemeLedgerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scheme Ledger</CardTitle>
        <CardDescription>Recent financial activity for this scheme.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="py-3 px-4 text-left font-medium">Date</th>
                <th className="py-3 px-4 text-left font-medium">Member</th>
                <th className="py-3 px-4 text-left font-medium">Type</th>
                <th className="py-3 px-4 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((t) => {
                  const profile = Array.isArray(t.profiles) ? t.profiles[0] : t.profiles;
                  const fullName = profile?.full_name || 'Unknown';

                  return (
                    <tr key={t.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 text-sm whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {fullName}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={t.type === 'deposit' ? 'default' : 'secondary'} className="capitalize text-[10px]">
                          {t.type}
                        </Badge>
                      </td>
                      <td className={`py-3 px-4 text-right text-sm font-bold ${t.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'deposit' ? '+' : '-'}₦{Number(t.amount).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground text-sm">
                    No transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
