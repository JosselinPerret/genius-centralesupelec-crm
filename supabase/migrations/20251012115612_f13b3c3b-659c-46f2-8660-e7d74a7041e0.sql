-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Managers and admins can insert companies" ON public.companies;

-- Create a new policy that allows all authenticated users to insert companies
CREATE POLICY "All authenticated users can insert companies"
ON public.companies
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);