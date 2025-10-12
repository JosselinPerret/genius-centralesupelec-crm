-- Drop the existing restrictive policy for tags
DROP POLICY IF EXISTS "Managers and admins can manage tags" ON public.tags;

-- Create policies that allow all authenticated users to manage tags
CREATE POLICY "All authenticated users can insert tags"
ON public.tags
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "All authenticated users can update tags"
ON public.tags
FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "All authenticated users can delete tags"
ON public.tags
FOR DELETE
USING (auth.uid() IS NOT NULL);