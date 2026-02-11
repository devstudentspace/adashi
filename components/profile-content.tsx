'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { InfoIcon } from "lucide-react";
import UserProfile from "@/components/user-profile";
import UserManagement from "@/components/user-management";
import { Suspense } from "react";

interface User {
  id: string;
  email: string | null;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export default function ProfileContent({ user }: { user: User }) {
  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          Manage your profile and account settings here.
        </div>
      </div>
      
      <div className="flex flex-col gap-8 w-full max-w-4xl">
        <Suspense fallback={<div>Loading profile...</div>}>
          <UserProfile initialUser={user} />
        </Suspense>
        <Suspense fallback={<div>Loading account management...</div>}>
          <UserManagement />
        </Suspense>
      </div>
    </div>
  );
}