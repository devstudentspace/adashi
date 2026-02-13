'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function UserManagement() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const supabase = createClient();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Password changed successfully!');

      // Reset form
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      console.error('Error changing password:', error.message);
      toast.error(`Failed to change password: ${error.message}`);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Change Password Section */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-medium mb-4">Change Password</h3>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <Label htmlFor="newPassword">New Password</Label>
                </div>
                <div className="md:col-span-2">
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                </div>
                <div className="md:col-span-2">
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={changingPassword}>
                  {changingPassword ? 'Changing Password...' : 'Change Password'}
                </Button>
              </div>
            </form>
          </div>

          {/* Account Deletion Section */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-medium mb-4">Delete Account</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <div className="flex justify-end">
              <Button variant="destructive" disabled>
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}