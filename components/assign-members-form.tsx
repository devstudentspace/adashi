'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Search, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Member {
  id: string;
  full_name: string;
  phone_number: string;
  home_address: string;
  hasContributions?: boolean;
}

export function AssignMembersForm({ schemeId }: { schemeId: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [contributedMemberIds, setContributedMemberIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchMembersAndAssignments = async () => {
      const supabase = createClient();
      
      try {
        // Fetch all members (non-admin users)
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, phone_number, home_address')
          .neq('role', 'admin'); // Exclude admins
        
        if (profilesError) throw profilesError;
        
        // Fetch existing assignments for this scheme
        const { data: existingAssignments, error: assignmentsError } = await supabase
          .from('scheme_members')
          .select('user_id')
          .eq('scheme_id', schemeId);
        
        if (assignmentsError) throw assignmentsError;

        // Fetch members who have made contributions to this scheme
        const { data: transactions, error: transactionsError } = await supabase
          .from('transactions')
          .select('user_id')
          .eq('scheme_id', schemeId)
          .eq('type', 'deposit')
          .limit(1000); // Reasonable limit for checking contributions

        if (transactionsError) throw transactionsError;

        const hasContributedIds = new Set(transactions?.map(t => t.user_id) || []);
        setContributedMemberIds(hasContributedIds);
        
        // Mark existing assignments as selected
        const existingIds = new Set(existingAssignments.map(a => a.user_id));
        setSelectedMembers(existingIds);
        
        const membersWithContribInfo = (profiles || []).map(m => ({
          ...m,
          hasContributions: hasContributedIds.has(m.id)
        }));

        setMembers(membersWithContribInfo);
      } catch (err) {
        console.error('Error fetching members:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch members');
      } finally {
        setLoading(false);
      }
    };

    fetchMembersAndAssignments();
  }, [schemeId]);

  const handleToggleMember = (memberId: string) => {
    const isSelected = selectedMembers.has(memberId);
    const hasContrib = contributedMemberIds.has(memberId);

    // Cannot REMOVE if they have contributions and are ALREADY in the scheme
    // But we CAN add them back if they are currently not selected
    if (hasContrib && isSelected) {
      return;
    }

    const newSelected = new Set(selectedMembers);
    if (isSelected) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const supabase = createClient();
    
    try {
      // 1. Get current assignments from DB to know who to delete
      const { data: currentDbAssignments } = await supabase
        .from('scheme_members')
        .select('user_id')
        .eq('scheme_id', schemeId);

      const currentDbIds = new Set(currentDbAssignments?.map(a => a.user_id) || []);
      
      // 2. Identify users to REMOVE (those in DB but NOT in selectedMembers)
      // Safety check: ensure they don't have contributions
      const toRemove = Array.from(currentDbIds).filter(id => 
        !selectedMembers.has(id) && !contributedMemberIds.has(id)
      );

      // 3. Identify users to ADD (those in selectedMembers but NOT in DB)
      const toAdd = Array.from(selectedMembers).filter(id => !currentDbIds.has(id));

      // Perform deletions
      if (toRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from('scheme_members')
          .delete()
          .eq('scheme_id', schemeId)
          .in('user_id', toRemove);
        
        if (deleteError) throw deleteError;
      }

      // Perform insertions
      if (toAdd.length > 0) {
        const insertData = toAdd.map(id => ({
          scheme_id: schemeId,
          user_id: id,
          status: 'active' as const
        }));

        const { error: insertError } = await supabase
          .from('scheme_members')
          .insert(insertData);
        
        if (insertError) throw insertError;
      }
      
      setSuccess(`Assignments updated successfully!`);
      setTimeout(() => {
        router.push(`/dashboard/admin/schemes/${schemeId}`);
      }, 1500);
    } catch (err) {
      console.error('Error assigning members:', err);
      setError(err instanceof Error ? err.message : 'Failed to assign members');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMembers = members.filter(member => 
    member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.phone_number?.includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="ml-2">Loading members...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Assign Members</CardTitle>
          <CardDescription>
            Manage participants for this scheme. Members with contributions are locked.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm font-medium">
                {success}
              </div>
            )}
            
            {/* Search Filter */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <span>All Members</span>
                <span>{filteredMembers.length} found</span>
              </div>
              
              <div className="space-y-2 max-h-[450px] overflow-y-auto p-1 pr-2 custom-scrollbar">
                {filteredMembers.length === 0 ? (
                  <div className="text-center py-12 border border-dashed rounded-xl bg-muted/20">
                    <p className="text-muted-foreground">No members found matching your search</p>
                  </div>
                ) : (
                  filteredMembers.map((member) => {
                    const hasContrib = contributedMemberIds.has(member.id);
                    const isSelected = selectedMembers.has(member.id);
                    // Only disable if they ARE selected AND have contributions
                    const isDisabled = hasContrib && isSelected;

                    return (
                      <div 
                        key={member.id} 
                        className={cn(
                          "flex items-center justify-between p-4 border rounded-xl transition-all",
                          hasContrib 
                            ? "bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-900" 
                            : "hover:bg-muted/50 border-border bg-card shadow-sm"
                        )}
                      >
                        <div className="flex items-center space-x-4">
                          <Checkbox
                            id={`member-${member.id}`}
                            checked={isSelected}
                            onCheckedChange={() => handleToggleMember(member.id)}
                            disabled={isDisabled}
                            className={cn(
                              hasContrib && "data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 opacity-80"
                            )}
                          />
                          <div className="grid gap-0.5">
                            <Label 
                              htmlFor={`member-${member.id}`} 
                              className={cn(
                                "text-sm font-bold cursor-pointer",
                                hasContrib && "text-green-700 dark:text-green-400"
                              )}
                            >
                              {member.full_name}
                            </Label>
                            <p className="text-xs text-muted-foreground font-medium">
                              {member.phone_number} {member.home_address ? `• ${member.home_address}` : ''}
                            </p>
                          </div>
                        </div>
                        
                        {hasContrib && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="p-1 text-green-600 dark:text-green-400 cursor-help">
                                  <Info className="h-4 w-4" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Cannot remove: This member has active contributions.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <p>
                  <span className="font-bold text-foreground">{selectedMembers.size}</span> selected
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span>{contributedMemberIds.size} with contributions</span>
                </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="px-8 font-bold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Assignments'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}