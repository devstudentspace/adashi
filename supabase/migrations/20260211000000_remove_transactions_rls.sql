-- Remove RLS restrictions on transactions table
-- This allows admins to freely access all transaction data

-- Drop existing RLS policies on transactions
DROP POLICY IF EXISTS "Admins can manage all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;

-- Disable RLS on transactions table
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;

-- Create a simple policy that allows all authenticated users to read transactions
-- and only admins to write/modify transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read transactions
CREATE POLICY "All authenticated users can view transactions" ON public.transactions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admins to manage all transactions
CREATE POLICY "Admins can manage all transactions" ON public.transactions
    FOR ALL USING (public.is_admin());

-- Allow users to insert their own transactions (for any future self-service features)
CREATE POLICY "Users can insert their own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);