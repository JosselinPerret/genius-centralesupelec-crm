-- Allow admins to update user profiles (especially roles)
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'ADMIN'))
WITH CHECK (has_role(auth.uid(), 'ADMIN'));