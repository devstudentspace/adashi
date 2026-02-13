'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface User {
  id: string;
  email: string | null;
  created_at: string;
  role?: string;
  user_metadata?: {
    full_name?: string;
  };
}

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const supabase = createClient();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Note: In a real application, you would need proper admin privileges to fetch all users
      // This requires a server-side function with service role key to list all users
      // For security reasons, client-side code cannot list all users by default
      // This is just a placeholder - in a real app, you'd call an API route that has admin privileges
      const { data: { users }, error } = await supabase.auth.admin.listUsers();

      if (error) {
        // If user doesn't have admin privileges, show empty list
        console.warn('Admin privileges required to list users:', error.message);
        setUsers([]);
      } else if (users) {
        // Format the user data
        const formattedUsers = users.map(user => ({
          id: user.id,
          email: user.email || null,
          created_at: user.created_at,
          role: user.role,
          user_metadata: user.user_metadata
        }));

        setUsers(formattedUsers);
      } else {
        setUsers([]);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error.message);
      toast.error('Failed to load users');
      setUsers([]); // Show empty list on error
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_metadata?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading users...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="w-1/3">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={fetchUsers}>Refresh</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">ID</th>
                  <th className="text-left py-2">Email</th>
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Role</th>
                  <th className="text-left py-2">Created</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="py-2 text-sm max-w-[120px] truncate" title={user.id}>{user.id.substring(0, 8)}...</td>
                    <td className="py-2 text-sm">{user.email}</td>
                    <td className="py-2 text-sm">{user.user_metadata?.full_name || '-'}</td>
                    <td className="py-2 text-sm">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role || 'user'}
                      </Badge>
                    </td>
                    <td className="py-2 text-sm">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="py-2 text-sm">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">Remove</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}