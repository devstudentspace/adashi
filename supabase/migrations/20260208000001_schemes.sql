-- Create Enums
DO $$ BEGIN
    CREATE TYPE public.scheme_type AS ENUM ('akawo', 'kwanta', 'ajita');
    CREATE TYPE public.contribution_frequency AS ENUM ('daily', 'weekly', 'monthly');
    CREATE TYPE public.member_status AS ENUM ('active', 'completed', 'defaulted');
    CREATE TYPE public.transaction_type AS ENUM ('deposit', 'withdrawal', 'fee');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Schemes Table
CREATE TABLE IF NOT EXISTS public.schemes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type public.scheme_type NOT NULL,
  admin_id uuid REFERENCES public.profiles(id) NOT NULL,
  contribution_amount decimal(12, 2) NOT NULL,
  frequency public.contribution_frequency DEFAULT 'daily',
  start_date date DEFAULT CURRENT_DATE,
  end_date date,
  rules jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Scheme Members Table
CREATE TABLE IF NOT EXISTS public.scheme_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  scheme_id uuid REFERENCES public.schemes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  joined_at timestamp with time zone DEFAULT now(),
  status public.member_status DEFAULT 'active',
  payout_order int, -- Useful for Kwanta
  UNIQUE(scheme_id, user_id)
);

-- Transactions Table (The Ledger)
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  scheme_id uuid REFERENCES public.schemes(id) ON DELETE SET NULL,
  admin_id uuid REFERENCES public.profiles(id) NOT NULL,
  amount decimal(12, 2) NOT NULL,
  type public.transaction_type NOT NULL,
  date timestamp with time zone DEFAULT now(),
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Schemes Policies
CREATE POLICY "Admins can manage their schemes" ON public.schemes
    FOR ALL USING (auth.uid() = admin_id);

CREATE POLICY "Members can view schemes they belong to" ON public.schemes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.scheme_members 
            WHERE scheme_members.scheme_id = schemes.id AND scheme_members.user_id = auth.uid()
        )
    );

-- Members Policies
CREATE POLICY "Admins can manage scheme members" ON public.scheme_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.schemes 
            WHERE schemes.id = scheme_members.scheme_id AND schemes.admin_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own membership" ON public.scheme_members
    FOR SELECT USING (auth.uid() = user_id);

-- Transaction Policies
CREATE POLICY "Admins can manage transactions for their schemes" ON public.transactions
    FOR ALL USING (auth.uid() = admin_id);

CREATE POLICY "Users can view their own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);
