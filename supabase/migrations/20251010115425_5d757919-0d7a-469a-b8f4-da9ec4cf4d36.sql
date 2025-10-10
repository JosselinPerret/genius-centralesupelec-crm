-- Update RLS policies to allow everyone to see and modify companies

-- Drop old company policies
DROP POLICY IF EXISTS "Admins and managers can view all companies" ON public.companies;
DROP POLICY IF EXISTS "Volunteers can view assigned companies" ON public.companies;
DROP POLICY IF EXISTS "Managers and admins can update companies" ON public.companies;

-- Create new policies: Everyone can view and update companies
CREATE POLICY "Everyone can view all companies"
ON public.companies
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Everyone can update companies"
ON public.companies
FOR UPDATE
TO authenticated
USING (true);

-- Keep existing insert and delete policies
-- Managers and admins can insert companies (already exists)
-- Only admins can delete companies (already exists)