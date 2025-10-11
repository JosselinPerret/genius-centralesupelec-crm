-- Allow users to create their own assignments
CREATE POLICY "Users can create their own assignments"
ON assignments
FOR INSERT
WITH CHECK (auth.uid() = user_id);