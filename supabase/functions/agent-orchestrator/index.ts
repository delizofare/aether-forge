import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { taskId, userInput } = await req.json();
    console.log('Processing task:', taskId, 'Input:', userInput);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Update task status to planning
    await supabaseClient
      .from('tasks')
      .update({ status: 'planning' })
      .eq('id', taskId);

    // Step 1: Use OpenRouter to create a plan
    const plan = await createPlan(userInput);
    console.log('Generated plan:', plan);

    // Update task status to executing
    await supabaseClient
      .from('tasks')
      .update({ status: 'executing' })
      .eq('id', taskId);

    // Execute each step in the plan
    const results = [];
    for (let i = 0; i < plan.steps.length; i++) {
      const step = plan.steps[i];
      console.log(`Executing step ${i + 1}:`, step);

      // Create execution step record
      const { data: stepRecord } = await supabaseClient
        .from('execution_steps')
        .insert({
          task_id: taskId,
          step_number: i + 1,
          tool_name: step.tool,
          tool_input: step.input,
          status: 'executing'
        })
        .select()
        .single();

      try {
        let stepResult;
        
        // Route to appropriate tool
        switch (step.tool) {
          case 'tavily_search':
            stepResult = await executeTavilySearch(step.input);
            break;
          case 'browseai_scrape':
            stepResult = await executeBrowseAI(step.input);
            break;
          case 'apify_scrape':
            stepResult = await executeApify(step.input);
            break;
          default:
            stepResult = { error: 'Unknown tool' };
        }

        // Update step as completed
        await supabaseClient
          .from('execution_steps')
          .update({
            tool_output: stepResult,
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', stepRecord.id);

        results.push(stepResult);

        // Store scraped data if applicable
        if (step.tool.includes('scrape') && stepResult.data) {
          await supabaseClient
            .from('scraped_data')
            .insert({
              task_id: taskId,
              url: step.input.url,
              data: stepResult.data,
              metadata: stepResult.metadata
            });
        }
      } catch (error) {
        console.error(`Step ${i + 1} failed:`, error);
        await supabaseClient
          .from('execution_steps')
          .update({
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            completed_at: new Date().toISOString()
          })
          .eq('id', stepRecord.id);
        
        throw error;
      }
    }

    // Generate final summary using OpenRouter
    const summary = await generateSummary(userInput, results);

    // Update task as completed
    await supabaseClient
      .from('tasks')
      .update({
        status: 'completed',
        result: { summary, steps: results },
        completed_at: new Date().toISOString()
      })
      .eq('id', taskId);

    return new Response(
      JSON.stringify({ success: true, summary, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in orchestrator:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function createPlan(userInput: string) {
  const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        {
          role: 'system',
          content: `You are an AI task planner. Break down user requests into executable steps using these tools:
- tavily_search: For finding information online
- browseai_scrape: For simple data extraction (tables, prices, emails)
- apify_scrape: For complex scraping with navigation and login

Respond with a JSON object: { "steps": [{ "tool": "tool_name", "input": {...}, "description": "what this step does" }] }`
        },
        {
          role: 'user',
          content: userInput
        }
      ],
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

async function executeTavilySearch(input: any) {
  const TAVILY_API_KEY = Deno.env.get('TAVILY_API_KEY');
  
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: TAVILY_API_KEY,
      query: input.query,
      search_depth: 'advanced',
      include_answer: true,
      max_results: input.max_results || 5
    }),
  });

  return await response.json();
}

async function executeBrowseAI(input: any) {
  const BROWSEAI_API_KEY = Deno.env.get('BROWSEAI_API_KEY');
  
  const response = await fetch(`https://api.browse.ai/v2/robots/${input.robot_id}/tasks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${BROWSEAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputParameters: input.parameters
    }),
  });

  const task = await response.json();
  
  // Poll for results (simplified - in production, use webhooks)
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const resultResponse = await fetch(`https://api.browse.ai/v2/robots/${input.robot_id}/tasks/${task.result.id}`, {
    headers: {
      'Authorization': `Bearer ${BROWSEAI_API_KEY}`,
    },
  });

  return await resultResponse.json();
}

async function executeApify(input: any) {
  const APIFY_API_KEY = Deno.env.get('APIFY_API_KEY');
  
  const response = await fetch(`https://api.apify.com/v2/acts/${input.actor_id}/runs?token=${APIFY_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input.input),
  });

  const run = await response.json();
  
  // Wait for completion
  let status = 'RUNNING';
  let dataset;
  
  while (status === 'RUNNING') {
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const statusResponse = await fetch(`https://api.apify.com/v2/acts/${input.actor_id}/runs/${run.data.id}?token=${APIFY_API_KEY}`);
    const statusData = await statusResponse.json();
    status = statusData.data.status;
    
    if (status === 'SUCCEEDED') {
      const datasetId = statusData.data.defaultDatasetId;
      const datasetResponse = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_API_KEY}`);
      dataset = await datasetResponse.json();
    }
  }

  return { status, data: dataset };
}

async function generateSummary(userInput: string, results: any[]) {
  const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant. Summarize the results of the executed tasks in a clear, concise way for the user.'
        },
        {
          role: 'user',
          content: `User requested: ${userInput}\n\nResults from execution:\n${JSON.stringify(results, null, 2)}\n\nProvide a clear summary of what was accomplished.`
        }
      ],
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}