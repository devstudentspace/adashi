import { createAdminClient } from "@/lib/supabase/server";
import { Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function MembersTable({ 
  query, 
  view = "auto" 
}: { 
  query?: string, 
  view?: string 
}) {
  const supabase = createAdminClient();

  // Fetch profiles with role 'member'
  let dbQuery = supabase
    .from('profiles')
    .select('*')
    .eq('role', 'member');

  if (query) {
    dbQuery = dbQuery.or(`full_name.ilike.%${query}%,phone_number.ilike.%${query}%`);
  }

  const { data: members, error } = await dbQuery.order('created_at', { ascending: false });

  if (error) {
      console.error("Error fetching members:", error);
      return <div className="text-red-500 p-4 border rounded-lg bg-red-50 text-sm">Failed to load members. Please refresh.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Grid View (Visible if view is grid OR auto) */}
      <div className={cn(
        "grid grid-cols-1 gap-4",
        view === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "md:hidden"
      )}>
        {members && members.length > 0 ? (
          members.map((member) => (
            <div key={member.id} className="bg-card border rounded-xl p-4 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {member.full_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-bold text-sm leading-none mb-1">{member.full_name || 'Unnamed'}</p>
                    <Badge variant="secondary" className="text-[10px] h-4">ACTIVE</Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="h-8 text-xs">View</Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 pt-2 border-t text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Phone</p>
                  <p className="flex items-center gap-1 mt-0.5 truncate">
                    <Phone className="h-3 w-3 text-primary shrink-0" /> {member.phone_number || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Joined</p>
                  <p className="mt-0.5">{new Date(member.created_at).toLocaleDateString()}</p>
                </div>
                <div className="col-span-2 pt-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Address</p>
                  <p className="mt-0.5 text-muted-foreground truncate">{member.home_address || 'No address provided'}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed col-span-full">
            No members found.
          </div>
        )}
      </div>

      {/* Table View (Visible if view is table OR auto) */}
      <div className={cn(
        "overflow-hidden rounded-xl border bg-card",
        view === "table" ? "block" : "hidden md:block"
      )}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="p-4 font-semibold">Member</th>
                <th className="p-4 font-semibold">Contact</th>
                <th className="p-4 font-semibold">Address</th>
                <th className="p-4 font-semibold">Joined</th>
                <th className="p-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members && members.length > 0 ? (
                members.map((member) => (
                  <tr key={member.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                         <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                            {member.full_name?.charAt(0) || '?'}
                         </div>
                         <div>
                            <p className="font-semibold">{member.full_name || 'Unnamed Member'}</p>
                            <Badge variant="outline" className="text-[10px] uppercase py-0 px-1">Active</Badge>
                         </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                         <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-primary" /> {member.phone_number || 'N/A'}
                         </div>
                      </div>
                    </td>
                    <td className="p-4 max-w-[150px] truncate text-muted-foreground">
                       {member.home_address || 'N/A'}
                    </td>
                    <td className="p-4 text-muted-foreground whitespace-nowrap">
                       {new Date(member.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm" className="h-8">View</Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">No members found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}