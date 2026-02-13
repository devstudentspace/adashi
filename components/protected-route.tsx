'use client';

import { ReactNode, useEffect } from 'react';
import { useRedirectIfNotAuthenticated } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectPath?: string;
}

export default function ProtectedRoute({
  children,
  fallback = (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Verifying Authentication</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </CardContent>
    </Card>
  ),
  redirectPath = '/auth/login'
}: ProtectedRouteProps) {
  const { user, loading } = useRedirectIfNotAuthenticated(redirectPath);

  if (loading) {
    return fallback;
  }

  // If user is authenticated, render the children
  if (user) {
    return <>{children}</>;
  }

  // If not authenticated, the hook will handle redirection
  return fallback;
}