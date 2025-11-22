-- Create tasks table to store user requests and execution history
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'planning', 'executing', 'completed', 'failed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  result JSONB,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create execution_steps table to track agent's step-by-step execution
CREATE TABLE public.execution_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  tool_name TEXT NOT NULL,
  tool_input JSONB NOT NULL,
  tool_output JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'executing', 'completed', 'failed')),
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create scraped_data table to store web scraping results
CREATE TABLE public.scraped_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  data JSONB NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraped_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tasks (users can only see their own tasks)
CREATE POLICY "Users can view their own tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for execution_steps
CREATE POLICY "Users can view steps for their tasks"
  ON public.execution_steps FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.tasks
    WHERE tasks.id = execution_steps.task_id
    AND tasks.user_id = auth.uid()
  ));

CREATE POLICY "Users can create steps for their tasks"
  ON public.execution_steps FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tasks
    WHERE tasks.id = execution_steps.task_id
    AND tasks.user_id = auth.uid()
  ));

-- RLS Policies for scraped_data
CREATE POLICY "Users can view scraped data for their tasks"
  ON public.scraped_data FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.tasks
    WHERE tasks.id = scraped_data.task_id
    AND tasks.user_id = auth.uid()
  ));

CREATE POLICY "Users can create scraped data for their tasks"
  ON public.scraped_data FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tasks
    WHERE tasks.id = scraped_data.task_id
    AND tasks.user_id = auth.uid()
  ));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on tasks
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_execution_steps_task_id ON public.execution_steps(task_id);
CREATE INDEX idx_scraped_data_task_id ON public.scraped_data(task_id);