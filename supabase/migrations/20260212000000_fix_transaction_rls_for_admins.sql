-- Fix RLS policies to properly allow admins to view member transactions
-- while maintaining security boundaries

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "All authenticated users can view transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can manage all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;

-- Allow users to view their own transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Allow admins to view all transactions in schemes they manage
CREATE POLICY "Admins can view all transactions in their schemes" ON public.transactions
    FOR SELECT USING (
        public.is_admin() OR 
        EXISTS (
            SELECT 1 FROM public.schemes
            WHERE schemes.id = transactions.scheme_id AND schemes.admin_id = auth.uid()
        )
    );

-- Allow admins to manage all transactions
CREATE POLICY "Admins can manage all transactions" ON public.transactions
    FOR ALL USING (public.is_admin());

-- Allow users to insert their own transactions (for any future self-service features)
CREATE POLICY "Users can insert their own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);