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
import { useRouter } from 'next/navigation';

interface Member {
  id: string;
  full_name: string;
  phone_number: string;
  home_address: string;
}

interface Scheme {
  id: string;
  name: string;
}

export function AssignMembersForm({ schemeId }: { schemeId: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
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
        
        // Mark existing assignments as selected
        const existingIds = new Set(existingAssignments.map(a => a.user_id));
        setSelectedMembers(existingIds);
        
        setMembers(profiles || []);
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
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    
    try {
      // Find members to add (selected but not previously assigned)
      const existingAssignments = new Set(
        members.filter(m => selectedMembers.has(m.id)).map(m => m.id)
      );
      
      // Remove all current assignments for this scheme first
      const { error: deleteError } = await supabase
        .from('scheme_members')
        .delete()
        .eq('scheme_id', schemeId);
      
      if (deleteError) throw deleteError;
      
      // Add all selected members back
      if (selectedMembers.size > 0) {
        const newAssignments = Array.from(selectedMembers).map(userId => ({
          scheme_id: schemeId,
          user_id: userId,
          status: 'active' as const
        }));
        
        const { error: insertError } = await supabase
          .from('scheme_members')
          .insert(newAssignments, { onConflict: ['scheme_id', 'user_id'] });
        
        if (insertError) throw insertError;
      }
      
      setSuccess(`${selectedMembers.size} members assigned successfully!`);
      setTimeout(() => {
        router.push(`/dashboard/admin/schemes/${schemeId}`);
      }, 1500);
    } catch (err) {
      console.error('Error assigning members:', err);
      setError(err instanceof Error ? err.message : 'Failed to assign members');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <p>Loading members...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Assign Members to Scheme</CardTitle>
          <CardDescription>
            Select members to add to this scheme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              {error && <p className="text-sm text-red-500">{error}</p>}
              {success && <p className="text-sm text-green-500">{success}</p>}
              
              <div className="space-y-4 max-h-96 overflow-y-auto p-2 border rounded-md">
                {members.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">No members found</p>
                ) : (
                  members.map((member) => (
                    <div 
                      key={member.id} 
                      className="flex items-center space-x-3 p-3 border rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={`member-${member.id}`}
                        checked={selectedMembers.has(member.id)}
                        onCheckedChange={() => handleToggleMember(member.id)}
                      />
                      <div className="grid gap-1">
                        <Label 
                          htmlFor={`member-${member.id}`} 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {member.full_name}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {member.phone_number} • {member.home_address}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedMembers.size} member(s)
                </p>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Assignments'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}