
-- Contractor specialties
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE TABLE public.contractor_specialties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_id UUID REFERENCES public.contractors(id) ON DELETE CASCADE NOT NULL,
    specialty TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
