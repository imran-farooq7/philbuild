-- Create system_settings table
CREATE TABLE public.system_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    platform_name TEXT DEFAULT 'PHILbuild',
    platform_email TEXT DEFAULT 'support@philbuild.com',
    contact_phone TEXT DEFAULT '+63 2 8123 4567',
    maintenance_mode BOOLEAN DEFAULT FALSE,
    auto_verify_threshold INTEGER DEFAULT 70,
    require_documents BOOLEAN DEFAULT TRUE,
    verification_timeout INTEGER DEFAULT 7,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    admin_alert_email TEXT DEFAULT 'admin@philbuild.com',
    default_project_duration INTEGER DEFAULT 90,
    max_budget_limit BIGINT DEFAULT 1000000000,
    require_insurance BOOLEAN DEFAULT TRUE,
    platform_fee DECIMAL(5,2) DEFAULT 5.0,
    min_platform_fee INTEGER DEFAULT 1000,
    max_platform_fee INTEGER DEFAULT 50000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES public.profiles(id)
);

-- Insert default settings
INSERT INTO public.system_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Add metadata column to projects if not exists
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Add user_status to profiles if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE;