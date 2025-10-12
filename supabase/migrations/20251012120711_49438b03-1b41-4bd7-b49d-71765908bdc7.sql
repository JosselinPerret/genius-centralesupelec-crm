-- Drop the existing restrictive policy for company_tags
DROP POLICY IF EXISTS "Managers and admins can manage company tags" ON public.company_tags;

-- Create policies that allow all authenticated users to manage company tags
CREATE POLICY "All authenticated users can insert company tags"
ON public.company_tags
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "All authenticated users can delete company tags"
ON public.company_tags
FOR DELETE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "All authenticated users can update company tags"
ON public.company_tags
FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);