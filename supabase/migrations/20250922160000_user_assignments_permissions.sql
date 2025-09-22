-- Update RLS policies for assignments to allow users to manage their own assignments

-- Drop existing policies
DROP POLICY IF EXISTS "Managers and admins can manage assignments" ON public.assignments;

-- Allow managers and admins to manage any assignments
CREATE POLICY "Managers and admins can manage all assignments" 
  ON public.assignments FOR ALL 
  USING (public.get_current_user_role() IN ('ADMIN', 'MANAGER'))
  WITH CHECK (public.get_current_user_role() IN ('ADMIN', 'MANAGER'));

-- Allow users to insert their own assignments
CREATE POLICY "Users can create their own assignments" 
  ON public.assignments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own assignments
CREATE POLICY "Users can delete their own assignments" 
  ON public.assignments FOR DELETE 
  USING (auth.uid() = user_id);

-- Allow users to update their own assignments
CREATE POLICY "Users can update their own assignments" 
  ON public.assignments FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
