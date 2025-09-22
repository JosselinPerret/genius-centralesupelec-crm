-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('ADMIN', 'MANAGER', 'VOLUNTEER');

-- Create company status enum  
CREATE TYPE public.company_status AS ENUM ('PROSPECT', 'ACTIVE', 'INACTIVE', 'FORMER');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'VOLUNTEER',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create tags table
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on tags
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  phone TEXT,
  status company_status NOT NULL DEFAULT 'PROSPECT',
  booth_number TEXT,
  booth_location TEXT,
  booth_size TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Create notes table
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notes
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create assignments table
CREATE TABLE public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'CONTACT',
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, user_id, role)
);

-- Enable RLS on assignments
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Create company_tags junction table
CREATE TABLE public.company_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, tag_id)
);

-- Enable RLS on company_tags
ALTER TABLE public.company_tags ENABLE ROW LEVEL SECURITY;

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tags_updated_at
  BEFORE UPDATE ON public.tags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'name', new.email),
    'VOLUNTEER'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::text FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for companies
CREATE POLICY "Users can view all companies" 
  ON public.companies FOR SELECT 
  USING (true);

CREATE POLICY "Managers and admins can insert companies" 
  ON public.companies FOR INSERT 
  WITH CHECK (public.get_current_user_role() IN ('ADMIN', 'MANAGER'));

CREATE POLICY "Managers and admins can update companies" 
  ON public.companies FOR UPDATE 
  USING (public.get_current_user_role() IN ('ADMIN', 'MANAGER'));

CREATE POLICY "Only admins can delete companies" 
  ON public.companies FOR DELETE 
  USING (public.get_current_user_role() = 'ADMIN');

-- RLS Policies for tags
CREATE POLICY "Users can view all tags" 
  ON public.tags FOR SELECT 
  USING (true);

CREATE POLICY "Managers and admins can manage tags" 
  ON public.tags FOR ALL 
  USING (public.get_current_user_role() IN ('ADMIN', 'MANAGER'))
  WITH CHECK (public.get_current_user_role() IN ('ADMIN', 'MANAGER'));

-- RLS Policies for notes
CREATE POLICY "Users can view all notes" 
  ON public.notes FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert notes" 
  ON public.notes FOR INSERT 
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own notes" 
  ON public.notes FOR UPDATE 
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own notes or admins can delete any" 
  ON public.notes FOR DELETE 
  USING (auth.uid() = author_id OR public.get_current_user_role() = 'ADMIN');

-- RLS Policies for assignments
CREATE POLICY "Users can view all assignments" 
  ON public.assignments FOR SELECT 
  USING (true);

CREATE POLICY "Managers and admins can manage assignments" 
  ON public.assignments FOR ALL 
  USING (public.get_current_user_role() IN ('ADMIN', 'MANAGER'))
  WITH CHECK (public.get_current_user_role() IN ('ADMIN', 'MANAGER'));

-- RLS Policies for company_tags
CREATE POLICY "Users can view all company tags" 
  ON public.company_tags FOR SELECT 
  USING (true);

CREATE POLICY "Managers and admins can manage company tags" 
  ON public.company_tags FOR ALL 
  USING (public.get_current_user_role() IN ('ADMIN', 'MANAGER'))
  WITH CHECK (public.get_current_user_role() IN ('ADMIN', 'MANAGER'));

-- Insert default tags
INSERT INTO public.tags (name, color) VALUES
  ('Enterprise', '#3B82F6'),
  ('Startup', '#10B981'),
  ('SMB', '#F59E0B'),
  ('Tech', '#8B5CF6');

-- Insert sample companies
INSERT INTO public.companies (name, contact_name, contact_email, phone, status, booth_number, booth_location, booth_size) VALUES
  ('TechCorp Solutions', 'Sarah Johnson', 'sarah@techcorp.com', '+1 (555) 123-4567', 'ACTIVE', 'A-101', 'Hall A', '10x10'),
  ('Innovation Labs', 'Mike Chen', 'mike@innovationlabs.com', '+1 (555) 987-6543', 'PROSPECT', 'B-205', 'Hall B', '8x8'),
  ('Global Enterprises Inc', 'Lisa Rodriguez', 'lisa@globalent.com', '+1 (555) 456-7890', 'ACTIVE', 'C-301', 'Hall C', '12x12'),
  ('StartupFlow', 'David Park', 'david@startupflow.io', '+1 (555) 321-0987', 'INACTIVE', null, null, null),
  ('Legacy Systems Co', 'Robert Smith', 'robert@legacysys.com', '+1 (555) 654-3210', 'FORMER', null, null, null);