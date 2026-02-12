-- Remove all RLS restrictions on transactions table for testing
-- This allows everyone to view and manage all transactions

-- Drop all existing policies on transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can view all transactions in their schemes" ON public.transactions;
DROP POLICY IF EXISTS "Admins can manage all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;

-- Disable RLS completely on transactions table
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;

-- Create a simple policy that allows all authenticated users to read and write transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to perform all operations on transactions
CREATE POLICY "All authenticated users can manage transactions" ON public.transactions
    FOR ALL USING (auth.role() = 'authenticated');