-- Add description field to schemes table
ALTER TABLE public.schemes ADD COLUMN IF NOT EXISTS description TEXT;

-- Update existing records to have an empty description if they have rules stored as description
UPDATE public.schemes 
SET description = rules->>'description'
WHERE rules ? 'description' AND description IS NULL;