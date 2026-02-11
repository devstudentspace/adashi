'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface User {
  id: string;
  email: string | null;
  created_at: string;
  role: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface UserManagementTableProps {
  initialUsers: User[];
}

export default function UserManagementTable({ initialUsers }: UserManagementTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState('');

  const handleRoleChange = (userId: string) => {
    setEditingUserId(userId);
    const user = users.find(u => u.id === userId);
    if (user) {
      setEditingRole(user.role);
    }
  };

  const saveRoleChange = async () => {
    if (!editingUserId) return;

    try {
      // In a real application, you would update the user role via an API route
      // with admin privileges
      console.log(`Updating user ${editingUserId} to role ${editingRole}`);

      // Update local state
      setUsers(users.map(user =>
        user.id === editingUserId ? { ...user, role: editingRole } : user
      ));

      toast.success('User role updated successfully!');
      setEditingUserId(null);
    } catch (error: any) {
      console.error('Error updating user role:', error.message);
      toast.error('Failed to update user role');
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_metadata?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
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
            <Button onClick={() => window.location.reload()}>Refresh</Button>
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
                      {editingUserId === user.id ? (
                        <div className="flex items-center gap-2">
                          <Select value={editingRole} onValueChange={setEditingRole}>
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="moderator">Moderator</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" onClick={saveRoleChange}>Save</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingUserId(null)}>Cancel</Button>
                        </div>
                      ) : (
                        <Badge variant={user.role === 'admin' ? 'default' : user.role === 'moderator' ? 'secondary' : 'outline'}>
                          {user.role}
                        </Badge>
                      )}
                    </td>
                    <td className="py-2 text-sm">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="py-2 text-sm">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRoleChange(user.id)}
                        >
                          Edit Role
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          Remove
                        </Button>
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