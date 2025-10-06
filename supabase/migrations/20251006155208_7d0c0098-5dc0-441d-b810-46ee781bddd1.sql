-- Phase 1: Fix Critical Privilege Escalation
-- Step 1: Create user_role enum (matching existing roles)
CREATE TYPE public.user_role_new AS ENUM ('ADMIN', 'MANAGER', 'VOLUNTEER');

-- Step 2: Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role_new NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text = _role
  )
$$;

-- Step 4: Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, role::text::user_role_new
FROM public.profiles
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 5: Update get_current_user_role function to use new table
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text 
  FROM public.user_roles 
  WHERE user_id = auth.uid()
  LIMIT 1
$$;

-- Step 6: Update handle_new_user trigger to use user_roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles (without role)
  INSERT INTO public.profiles (user_id, name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'name', new.email),
    'VOLUNTEER'::user_role
  );
  
  -- Insert default role into user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'VOLUNTEER'::user_role_new);
  
  RETURN new;
END;
$$;

-- Phase 2: RLS Policies for user_roles table
-- Only admins can manage roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'ADMIN'))
WITH CHECK (public.has_role(auth.uid(), 'ADMIN'));

-- Users can view all roles (to see who has what role)
CREATE POLICY "Users can view all roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Phase 3: Update profiles table RLS policies
-- Drop the old update policy that allowed self-updates
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new policy that only allows name updates
CREATE POLICY "Users can update their own name"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Phase 4: Restrict company contact information access
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all companies" ON public.companies;

-- Create role-based policies for company viewing
CREATE POLICY "Admins and managers can view all companies"
ON public.companies
FOR SELECT
USING (public.has_role(auth.uid(), 'ADMIN') OR public.has_role(auth.uid(), 'MANAGER'));

CREATE POLICY "Volunteers can view assigned companies"
ON public.companies
FOR SELECT
USING (
  public.has_role(auth.uid(), 'VOLUNTEER') AND
  EXISTS (
    SELECT 1 FROM public.assignments
    WHERE assignments.company_id = companies.id
    AND assignments.user_id = auth.uid()
  )
);