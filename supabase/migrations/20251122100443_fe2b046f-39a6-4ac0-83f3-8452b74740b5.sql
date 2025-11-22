-- Temporarily disable RLS for prototype (WARNING: Enable auth and proper RLS for production!)
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_steps DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraped_data DISABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can create their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;

DROP POLICY IF EXISTS "Users can create steps for their tasks" ON public.execution_steps;
DROP POLICY IF EXISTS "Users can view steps for their tasks" ON public.execution_steps;

DROP POLICY IF EXISTS "Users can create scraped data for their tasks" ON public.scraped_data;
DROP POLICY IF EXISTS "Users can view scraped data for their tasks" ON public.scraped_data;