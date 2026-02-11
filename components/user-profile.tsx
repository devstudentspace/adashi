'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string | null;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface UserProfileProps {
  initialUser?: {
    id: string;
    email: string | null;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
}

export default function UserProfile({ initialUser }: UserProfileProps = {}) {
  const [user, setUser] = useState(initialUser || null);
  const [loading, setLoading] = useState(!initialUser);
  const [updating, setUpdating] = useState(false);
  const [fullName, setFullName] = useState(initialUser?.user_metadata?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(initialUser?.user_metadata?.avatar_url || '');

  const supabase = createClient();

  useEffect(() => {
    if (!initialUser) {
      fetchUserProfile();
    }
  }, [initialUser]);

  const fetchUserProfile = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) throw error;

      if (user) {
        setUser({
          id: user.id,
          email: user.email || null,
          user_metadata: user.user_metadata
        });

        setFullName(user.user_metadata?.full_name || '');
        setAvatarUrl(user.user_metadata?.avatar_url || '');
      }
    } catch (error: any) {
      console.error('Error fetching user profile:', error.message);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async () => {
    setUpdating(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          avatar_url: avatarUrl
        }
      });

      if (error) throw error;

      toast.success('Profile updated successfully!');
      fetchUserProfile(); // Refresh the profile data
    } catch (error: any) {
      console.error('Error updating profile:', error.message);
      toast.error('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Profile...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading your profile information...</p>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>User not found. Please log in again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Label htmlFor="email">Email</Label>
            </div>
            <div className="md:col-span-2">
              <Input id="email" value={user.email || ''} readOnly />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Label htmlFor="fullName">Full Name</Label>
            </div>
            <div className="md:col-span-2">
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Label htmlFor="avatarUrl">Avatar URL</Label>
            </div>
            <div className="md:col-span-2">
              <Input
                id="avatarUrl"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="Enter URL to your avatar image"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Label htmlFor="userId">User ID</Label>
            </div>
            <div className="md:col-span-2">
              <Input id="userId" value={user.id} readOnly />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={updateUserProfile} disabled={updating}>
              {updating ? 'Updating...' : 'Update Profile'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}