import { createAdminClient } from "@/lib/supabase/server";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  CreditCard,
  User,
  History
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { TransactionFilters } from "@/components/transaction-filters";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { cn } from "@/lib/utils";

export default async function TransactionsPage(props: {
  searchParams: Promise<{ 
    query?: string; 
    type?: string;
    page?: string;
    pageSize?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams.query;
  const typeFilter = searchParams.type;
  const page = parseInt(searchParams.page || "1");
  const pageSize = parseInt(searchParams.pageSize || "10");
  
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = createAdminClient();

  // 1. Fetch Summary Stats (Unfiltered for overall context, or filtered? Usually overall)
  const { data: allStats } = await supabase
    .from('transactions')
    .select('amount, type');

  const stats = {
    total: allStats?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0,
    deposits: allStats?.filter(t => t.type === 'deposit').reduce((acc, curr) => acc + Number(curr.amount), 0) || 0,
    withdrawals: allStats?.filter(t => t.type === 'withdrawal').reduce((acc, curr) => acc + Number(curr.amount), 0) || 0,
    fees: allStats?.filter(t => t.type === 'fee').reduce((acc, curr) => acc + Number(curr.amount), 0) || 0,
  };

  // 2. Fetch Paginated & Filtered Transactions
  // Note: Complex searching across joins is hard in simple Supabase queries if we want server-side search.
  // For now, we'll search on notes and filter by type. 
  // If we need to search by profile name, we'd ideally use a view or a more complex query.
  let dbQuery = supabase
    .from('transactions')
    .select(`
      *,
      profiles:user_id (full_name, phone_number),
      schemes:scheme_id (name, type)
    `, { count: 'exact' });

  if (typeFilter && typeFilter !== "all") {
    dbQuery = dbQuery.eq('type', typeFilter);
  }

  if (query) {
    // Search in notes. For member name search, we'd need a different approach or just filter client side for small datasets.
    // However, let's try to handle notes search at least.
    dbQuery = dbQuery.ilike('notes', `%${query}%`);
  }

  const { data: transactions, error, count } = await dbQuery
    .order('date', { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching transactions:", error);
  }

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Comprehensive history of all payments, withdrawals, and fees.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export CSV</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
               ₦{stats.total.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total processed amount</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Deposits</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
               ₦{stats.deposits.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Funds collected</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Withdrawals</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
               ₦{stats.withdrawals.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Funds paid out</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Service Fees</CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
               ₦{stats.fees.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">System revenue</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>View and manage all ledger entries.</CardDescription>
             </div>
             <TransactionFilters />
          </div>
        </CardHeader>
        <CardContent>
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
               <thead className="bg-muted/50 border-b">
                 <tr>
                   <th className="p-4 font-semibold">Date</th>
                   <th className="p-4 font-semibold">Member</th>
                   <th className="p-4 font-semibold">Scheme</th>
                   <th className="p-4 font-semibold">Type</th>
                   <th className="p-4 font-semibold text-right">Amount</th>
                   <th className="p-4 font-semibold">Notes</th>
                 </tr>
               </thead>
               <tbody>
                 {transactions && transactions.length > 0 ? (
                   transactions.map((t) => (
                     <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                       <td className="p-4 whitespace-nowrap">
                         <div className="flex items-center gap-2">
                           <Calendar className="h-3 w-3 text-muted-foreground" />
                           {format(new Date(t.date), 'MMM dd, yyyy HH:mm')}
                         </div>
                       </td>
                       <td className="p-4">
                          <div className="flex items-center gap-2">
                             <User className="h-3.5 w-3.5 text-primary" />
                             <span className="font-medium">{(t.profiles as any)?.full_name || 'N/A'}</span>
                          </div>
                       </td>
                       <td className="p-4">
                          <Badge variant="outline">{(t.schemes as any)?.name || 'General'}</Badge>
                       </td>
                       <td className="p-4">
                         {t.type === 'deposit' && (
                           <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">DEPOSIT</Badge>
                         )}
                         {t.type === 'withdrawal' && (
                           <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200">PAYOUT</Badge>
                         )}
                         {t.type === 'fee' && (
                           <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">FEE</Badge>
                         )}
                       </td>
                       <td className={cn(
                         "p-4 text-right font-bold",
                         t.type === 'deposit' ? "text-green-600" : (t.type === 'withdrawal' ? "text-orange-600" : "text-foreground")
                       )}>
                         {t.type === 'deposit' ? '+' : '-'}₦{Number(t.amount).toLocaleString()}
                       </td>
                       <td className="p-4 text-muted-foreground max-w-[200px] truncate">
                         {t.notes || '-'}
                       </td>
                     </tr>
                   ))
                 ) : (
                   <tr>
                     <td colSpan={6} className="p-8 text-center text-muted-foreground">No transactions found</td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>

           <PaginationControls 
              currentPage={page}
              pageSize={pageSize}
              totalItems={count || 0}
              totalPages={totalPages}
           />
        </CardContent>
      </Card>
    </div>
  );
}
