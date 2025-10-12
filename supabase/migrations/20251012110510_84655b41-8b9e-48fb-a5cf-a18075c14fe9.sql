-- Allow users to delete their own assignments
CREATE POLICY "Users can delete their own assignments"
ON public.assignments
FOR DELETE
USING (auth.uid() = user_id);