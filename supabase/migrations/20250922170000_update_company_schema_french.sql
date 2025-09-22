-- Update company status enum and remove booth fields, add notes field

-- Drop existing enum and recreate with new values
DROP TYPE IF EXISTS public.company_status CASCADE;
CREATE TYPE public.company_status AS ENUM ('PROSPECT', 'REFUSE', 'EN_COURS', 'RELANCE');

-- Remove booth columns and add notes column
ALTER TABLE public.companies 
DROP COLUMN IF EXISTS booth_number,
DROP COLUMN IF EXISTS booth_location, 
DROP COLUMN IF EXISTS booth_size,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update existing companies to use new status values
UPDATE public.companies 
SET status = CASE 
  WHEN status::text = 'ACTIVE' THEN 'EN_COURS'::company_status
  WHEN status::text = 'INACTIVE' THEN 'RELANCE'::company_status  
  WHEN status::text = 'FORMER' THEN 'REFUSE'::company_status
  ELSE 'PROSPECT'::company_status
END;
