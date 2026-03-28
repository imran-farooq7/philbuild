-- Additional tables for project management
CREATE TABLE public.project_scope (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.project_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    requirement TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    contractor_id UUID REFERENCES public.contractors(user_id),
    amount DECIMAL(15,2) NOT NULL,
    proposal TEXT NOT NULL,
    timeline_days INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns to projects table
ALTER TABLE public.projects 
ADD COLUMN published_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN awarded_at TIMESTAMP WITH TIME ZONE;

-- Storage buckets for project photos
INSERT INTO storage.buckets (id, name, public) VALUES ('project-photos', 'project-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('inspection-photos', 'inspection-photos', true);

-- Storage policies
CREATE POLICY "Project photos are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-photos');

CREATE POLICY "Contractors can upload project photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'project-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);