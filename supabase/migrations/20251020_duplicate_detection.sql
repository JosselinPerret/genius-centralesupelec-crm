-- Create company_merges audit table
CREATE TABLE IF NOT EXISTS public.company_merges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  master_company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE SET NULL,
  duplicate_company_id TEXT NOT NULL,
  merged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  merged_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on company_merges
ALTER TABLE public.company_merges ENABLE ROW LEVEL SECURITY;

-- Create index for audit trail
CREATE INDEX idx_company_merges_master ON public.company_merges(master_company_id);
CREATE INDEX idx_company_merges_merged_at ON public.company_merges(merged_at);

-- RLS policies for company_merges
CREATE POLICY "Allow read access to company_merges"
  ON public.company_merges FOR SELECT
  USING (true);

CREATE POLICY "Allow insert to company_merges"
  ON public.company_merges FOR INSERT
  WITH CHECK (true);
