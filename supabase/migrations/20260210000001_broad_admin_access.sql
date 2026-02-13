-- Broaden Admin Access Policies
-- Goal: Allow any user with role 'admin' to manage ALL schemes, scheme_members, and transactions.

-- 1. SCHEMES
DROP POLICY IF EXISTS "Admins can manage their schemes" ON public.schemes;

CREATE POLICY "Admins can manage all schemes" ON public.schemes
    FOR ALL USING (public.is_admin());

-- 2. SCHEME MEMBERS
DROP POLICY IF EXISTS "Admins can manage scheme members" ON public.scheme_members;

CREATE POLICY "Admins can manage all scheme members" ON public.scheme_members
    FOR ALL USING (public.is_admin());

-- 3. TRANSACTIONS
DROP POLICY IF EXISTS "Admins can manage transactions for their schemes" ON public.transactions;

CREATE POLICY "Admins can manage all transactions" ON public.transactions
    FOR ALL USING (public.is_admin());
