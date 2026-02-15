-- Fix RLS policy to allow users to create and manage their own schemes
-- While still allowing broader admin access

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Admins can manage all schemes" ON public.schemes;

-- Recreate policy to allow both: users managing their own schemes AND admins managing all schemes
CREATE POLICY "Users can manage their own schemes and admins can manage all" ON public.schemes
    FOR ALL USING (
        auth.uid() = admin_id OR public.is_admin()
    );