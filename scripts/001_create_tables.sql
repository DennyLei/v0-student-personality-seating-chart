-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher')) DEFAULT 'student',
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student assessments table
CREATE TABLE IF NOT EXISTS public.student_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  personality_type TEXT NOT NULL,
  learning_style TEXT NOT NULL,
  social_preference TEXT NOT NULL CHECK (social_preference IN ('collaborative', 'independent', 'mixed')),
  focus_level TEXT NOT NULL CHECK (focus_level IN ('high', 'medium', 'low')),
  noise_tolerance TEXT NOT NULL CHECK (noise_tolerance IN ('high', 'medium', 'low')),
  movement_needs TEXT NOT NULL CHECK (movement_needs IN ('high', 'medium', 'low')),
  peer_interaction TEXT NOT NULL CHECK (peer_interaction IN ('extroverted', 'introverted', 'balanced')),
  special_needs TEXT,
  assessment_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create seating charts table
CREATE TABLE IF NOT EXISTS public.seating_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  chart_name TEXT NOT NULL,
  classroom_layout JSONB NOT NULL,
  student_assignments JSONB NOT NULL,
  ai_reasoning TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seating_charts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_own" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Student assessments policies
CREATE POLICY "assessments_select_own" ON public.student_assessments 
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "assessments_insert_own" ON public.student_assessments 
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "assessments_update_own" ON public.student_assessments 
  FOR UPDATE USING (auth.uid() = student_id);

-- Teachers can view all student assessments
CREATE POLICY "teachers_view_all_assessments" ON public.student_assessments 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- Seating charts policies
CREATE POLICY "charts_select_own" ON public.seating_charts 
  FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "charts_insert_own" ON public.seating_charts 
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "charts_update_own" ON public.seating_charts 
  FOR UPDATE USING (auth.uid() = teacher_id);

CREATE POLICY "charts_delete_own" ON public.seating_charts 
  FOR DELETE USING (auth.uid() = teacher_id);

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
