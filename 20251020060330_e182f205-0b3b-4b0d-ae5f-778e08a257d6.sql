-- Create pollution_reports table
CREATE TABLE IF NOT EXISTS public.pollution_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  severity TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude DECIMAL,
  longitude DECIMAL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID,
  investigation_started_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.pollution_reports ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert reports (public submission)
CREATE POLICY "Anyone can submit pollution reports" 
ON public.pollution_reports 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow anyone to view reports
CREATE POLICY "Anyone can view pollution reports" 
ON public.pollution_reports 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_pollution_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_pollution_reports_timestamp
BEFORE UPDATE ON public.pollution_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_pollution_reports_updated_at();

-- Create index for faster queries
CREATE INDEX idx_pollution_reports_status ON public.pollution_reports(status);
CREATE INDEX idx_pollution_reports_submitted_at ON public.pollution_reports(submitted_at DESC);