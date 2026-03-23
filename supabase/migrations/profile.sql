-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    user_type TEXT CHECK (user_type IN ('admin', 'contractor', 'buyer')),
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contractors table
CREATE TABLE public.contractors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) UNIQUE NOT NULL,
    company_name TEXT NOT NULL,
    business_permit TEXT,
    pcab_license TEXT,
    bir_registration TEXT,
    years_in_business INTEGER,
    team_size INTEGER,
    certifications TEXT[],
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verification_score INTEGER DEFAULT 0,
    tier TEXT CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
    total_projects_completed INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buyers table
CREATE TABLE public.buyers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) UNIQUE NOT NULL,
    company_name TEXT,
    position TEXT,
    verified_phone BOOLEAN DEFAULT FALSE,
    total_projects_initiated INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    buyer_id UUID REFERENCES public.buyers(id) NOT NULL,
    contractor_id UUID REFERENCES public.contractors(id),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'completed', 'cancelled')),
    budget DECIMAL(15,2),
    current_cost DECIMAL(15,2) DEFAULT 0,
    start_date DATE,
    end_date DATE,
    completion_percentage INTEGER DEFAULT 0,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project updates (weekly reports)
CREATE TABLE public.project_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    week_number INTEGER NOT NULL,
    completion_percentage INTEGER NOT NULL,
    accomplishments TEXT,
    plans_for_next_week TEXT,
    issues_encountered TEXT,
    photos TEXT[],
    submitted_by UUID REFERENCES public.profiles(id),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inspections
CREATE TABLE public.inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    inspector_id UUID REFERENCES public.profiles(id),
    inspection_date DATE NOT NULL,
    type TEXT CHECK (type IN ('initial', 'progress', 'final', 'special')),
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    findings TEXT,
    recommendations TEXT,
    photos TEXT[],
    passed BOOLEAN,
    report_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budget tracking
CREATE TABLE public.budget_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    allocated_amount DECIMAL(15,2) NOT NULL,
    actual_amount DECIMAL(15,2) DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    contractor_id UUID REFERENCES public.contractors(id),
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    uploaded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policies (basic - you can expand later)
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);