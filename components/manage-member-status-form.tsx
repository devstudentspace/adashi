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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';

interface Member {
  id: string;
  full_name: string;
  phone_number: string;
  status: 'active' | 'completed' | 'defaulted';
}

export function ManageMemberStatusForm({ schemeId }: { schemeId: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchMembers = async () => {
      const supabase = createClient();
      
      try {
        // Fetch members assigned to this scheme with their current status
        const { data, error } = await supabase
          .from('scheme_members')
          .select(`
            id,
            status,
            profiles (id, full_name, phone_number)
          `)
          .eq('scheme_id', schemeId)
          .order('status', { ascending: false }); // Active first
        
        if (error) throw error;
        
        // Transform the data to match our interface
        const transformedMembers = data.map(item => ({
          id: item.profiles.id,
          full_name: item.profiles.full_name,
          phone_number: item.profiles.phone_number,
          status: item.status as 'active' | 'completed' | 'defaulted',
        }));
        
        setMembers(transformedMembers);
      } catch (err) {
        console.error('Error fetching members:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch members');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [schemeId]);

  const handleStatusChange = async (memberId: string, newStatus: 'active' | 'completed' | 'defaulted') => {
    const supabase = createClient();
    
    try {
      // Update the member's status in the scheme_members table
      const { error } = await supabase
        .from('scheme_members')
        .update({ status: newStatus })
        .eq('scheme_id', schemeId)
        .eq('user_id', memberId);
      
      if (error) throw error;
      
      // Update local state
      setMembers(prev => prev.map(member => 
        member.id === memberId ? { ...member, status: newStatus } : member
      ));
      
      setSuccess('Status updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update status');
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
          <CardTitle>Manage Member Statuses</CardTitle>
          <CardDescription>
            Update member statuses in this scheme (Active, Completed, Defaulted)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-green-500">{success}</p>}
            
            {members.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No members assigned to this scheme</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left">Name</th>
                      <th className="py-2 text-left">Phone</th>
                      <th className="py-2 text-left">Current Status</th>
                      <th className="py-2 text-left">Update Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.id} className="border-b hover:bg-muted/50">
                        <td className="py-3">{member.full_name}</td>
                        <td className="py-3">{member.phone_number}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            member.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : member.status === 'completed' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3">
                          <Select 
                            value={member.status} 
                            onValueChange={(value: 'active' | 'completed' | 'defaulted') => 
                              handleStatusChange(member.id, value)
                            }
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="Update status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="defaulted">Defaulted</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}