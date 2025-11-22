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

  let taskId: string | null = null;
  let supabaseClient: any = null;

  try {
    const { taskId: reqTaskId, userInput } = await req.json();
    taskId = reqTaskId;
    
    console.log('=== Task Started ===');
    console.log('Task ID:', taskId);
    console.log('User Input:', userInput);
    console.log('Timestamp:', new Date().toISOString());

    // Validate required API keys
    const requiredKeys = {
      SUPABASE_URL: Deno.env.get('SUPABASE_URL'),
      SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      OPENROUTER_API_KEY: Deno.env.get('OPENROUTER_API_KEY')
    };

    const missingKeys = Object.entries(requiredKeys)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingKeys.length > 0) {
      const errorMsg = `Missing required API keys: ${missingKeys.join(', ')}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    supabaseClient = createClient(
      requiredKeys.SUPABASE_URL!,
      requiredKeys.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Update task status to planning
    console.log('Updating task status to planning...');
    const { error: planningUpdateError } = await supabaseClient
      .from('tasks')
      .update({ 
        status: 'planning',
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId);

    if (planningUpdateError) {
      console.error('Failed to update task to planning:', planningUpdateError);
      throw new Error(`Database error: ${planningUpdateError.message}`);
    }

    // Step 1: Use OpenRouter to create a plan
    console.log('Creating execution plan...');
    const startPlanTime = Date.now();
    const plan = await createPlan(userInput);
    const planDuration = Date.now() - startPlanTime;
    console.log('Plan generated in', planDuration, 'ms:', JSON.stringify(plan, null, 2));

    if (!plan || !plan.steps || !Array.isArray(plan.steps)) {
      throw new Error('Invalid plan structure received from AI');
    }

    // Update task status to executing
    console.log('Updating task status to executing...');
    const { error: executingUpdateError } = await supabaseClient
      .from('tasks')
      .update({ 
        status: 'executing',
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId);

    if (executingUpdateError) {
      console.error('Failed to update task to executing:', executingUpdateError);
      throw new Error(`Database error: ${executingUpdateError.message}`);
    }

    // Execute each step in the plan
    const results = [];
    for (let i = 0; i < plan.steps.length; i++) {
      const step = plan.steps[i];
      console.log(`\n=== Executing Step ${i + 1}/${plan.steps.length} ===`);
      console.log('Tool:', step.tool);
      console.log('Input:', JSON.stringify(step.input, null, 2));

      // Create execution step record
      const { data: stepRecord, error: stepInsertError } = await supabaseClient
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

      if (stepInsertError) {
        console.error('Failed to create execution step:', stepInsertError);
        throw new Error(`Database error: ${stepInsertError.message}`);
      }

      try {
        let stepResult;
        const stepStartTime = Date.now();
        
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
            stepResult = { error: `Unknown tool: ${step.tool}` };
        }

        const stepDuration = Date.now() - stepStartTime;
        console.log(`Step ${i + 1} completed in ${stepDuration}ms`);

        // Update step as completed
        const { error: stepUpdateError } = await supabaseClient
          .from('execution_steps')
          .update({
            tool_output: stepResult,
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', stepRecord.id);

        if (stepUpdateError) {
          console.error('Failed to update step status:', stepUpdateError);
        }

        results.push(stepResult);

        // Store scraped data if applicable
        if (step.tool.includes('scrape') && stepResult.data) {
          const { error: scraperDataError } = await supabaseClient
            .from('scraped_data')
            .insert({
              task_id: taskId,
              url: step.input.url,
              data: stepResult.data,
              metadata: stepResult.metadata
            });

          if (scraperDataError) {
            console.error('Failed to store scraped data:', scraperDataError);
          }
        }
      } catch (stepError) {
        console.error(`Step ${i + 1} failed:`, stepError);
        
        const errorMessage = stepError instanceof Error ? stepError.message : 'Unknown error';
        
        await supabaseClient
          .from('execution_steps')
          .update({
            status: 'failed',
            error: errorMessage,
            completed_at: new Date().toISOString()
          })
          .eq('id', stepRecord.id);
        
        throw new Error(`Step ${i + 1} (${step.tool}) failed: ${errorMessage}`);
      }
    }

    // Generate final summary using OpenRouter
    console.log('\n=== Generating Summary ===');
    const summaryStartTime = Date.now();
    const summary = await generateSummary(userInput, results);
    const summaryDuration = Date.now() - summaryStartTime;
    console.log('Summary generated in', summaryDuration, 'ms');

    // Update task as completed
    console.log('Updating task status to completed...');
    const { error: completedUpdateError } = await supabaseClient
      .from('tasks')
      .update({
        status: 'completed',
        result: { summary, steps: results },
        completed_at: new Date().toISOString()
      })
      .eq('id', taskId);

    if (completedUpdateError) {
      console.error('Failed to update task to completed:', completedUpdateError);
    }

    console.log('=== Task Completed Successfully ===\n');

    return new Response(
      JSON.stringify({ success: true, summary, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('=== Orchestrator Error ===');
    console.error('Error:', errorMessage);
    console.error('Stack:', error instanceof Error ? error.stack : 'N/A');
    console.error('Timestamp:', new Date().toISOString());

    // Update task as failed if we have the taskId and client
    if (taskId && supabaseClient) {
      try {
        await supabaseClient
          .from('tasks')
          .update({
            status: 'failed',
            error: errorMessage,
            completed_at: new Date().toISOString()
          })
          .eq('id', taskId);
        console.log('Task marked as failed in database');
      } catch (updateError) {
        console.error('Failed to update task status to failed:', updateError);
      }
    }

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function createPlan(userInput: string) {
  const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
  
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  console.log('Calling OpenRouter API for plan creation...');
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-r1-0528:free',
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

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenRouter API error:', response.status, errorText);
    throw new Error(`OpenRouter API failed (${response.status}): ${errorText}`);
  }

  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    console.error('Failed to parse OpenRouter response:', parseError);
    throw new Error('Invalid JSON response from OpenRouter API');
  }

  console.log('OpenRouter response:', JSON.stringify(data, null, 2));

  if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
    console.error('Invalid response structure:', data);
    throw new Error('OpenRouter API returned invalid response structure');
  }

  const messageContent = data.choices[0]?.message?.content;
  if (!messageContent) {
    console.error('No message content in response:', data);
    throw new Error('OpenRouter API returned empty message content');
  }

  try {
    const plan = JSON.parse(messageContent);
    if (!plan.steps || !Array.isArray(plan.steps)) {
      throw new Error('Plan does not contain steps array');
    }
    return plan;
  } catch (parseError) {
    console.error('Failed to parse plan JSON:', messageContent);
    throw new Error(`Invalid plan format from AI: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
  }
}

async function executeTavilySearch(input: any) {
  const TAVILY_API_KEY = Deno.env.get('TAVILY_API_KEY');
  
  if (!TAVILY_API_KEY) {
    throw new Error('TAVILY_API_KEY is not configured');
  }

  console.log('Executing Tavily search:', input.query);
  
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

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Tavily API error:', response.status, errorText);
    throw new Error(`Tavily API failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  console.log('Tavily search completed, found', data.results?.length || 0, 'results');
  return data;
}

async function executeBrowseAI(input: any) {
  const BROWSEAI_API_KEY = Deno.env.get('BROWSEAI_API_KEY');
  
  if (!BROWSEAI_API_KEY) {
    throw new Error('BROWSEAI_API_KEY is not configured');
  }

  console.log('Executing BrowseAI scrape for robot:', input.robot_id);
  
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

  if (!response.ok) {
    const errorText = await response.text();
    console.error('BrowseAI API error:', response.status, errorText);
    throw new Error(`BrowseAI API failed (${response.status}): ${errorText}`);
  }

  const task = await response.json();
  
  if (!task.result?.id) {
    console.error('Invalid BrowseAI task response:', task);
    throw new Error('BrowseAI did not return a valid task ID');
  }

  console.log('BrowseAI task created:', task.result.id, '- waiting for completion...');
  
  // Poll for results (simplified - in production, use webhooks)
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const resultResponse = await fetch(`https://api.browse.ai/v2/robots/${input.robot_id}/tasks/${task.result.id}`, {
    headers: {
      'Authorization': `Bearer ${BROWSEAI_API_KEY}`,
    },
  });

  if (!resultResponse.ok) {
    const errorText = await resultResponse.text();
    console.error('BrowseAI result fetch error:', resultResponse.status, errorText);
    throw new Error(`Failed to fetch BrowseAI results (${resultResponse.status}): ${errorText}`);
  }

  const result = await resultResponse.json();
  console.log('BrowseAI task completed');
  return result;
}

async function executeApify(input: any) {
  const APIFY_API_KEY = Deno.env.get('APIFY_API_KEY');
  
  if (!APIFY_API_KEY) {
    throw new Error('APIFY_API_KEY is not configured');
  }

  console.log('Executing Apify actor:', input.actor_id);
  
  const response = await fetch(`https://api.apify.com/v2/acts/${input.actor_id}/runs?token=${APIFY_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input.input),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Apify API error:', response.status, errorText);
    throw new Error(`Apify API failed (${response.status}): ${errorText}`);
  }

  const run = await response.json();
  
  if (!run.data?.id) {
    console.error('Invalid Apify run response:', run);
    throw new Error('Apify did not return a valid run ID');
  }

  console.log('Apify run started:', run.data.id);
  
  // Wait for completion with timeout
  let status = 'RUNNING';
  let dataset;
  let attempts = 0;
  const maxAttempts = 60; // 3 minutes max wait
  
  while (status === 'RUNNING' && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    attempts++;
    
    const statusResponse = await fetch(`https://api.apify.com/v2/acts/${input.actor_id}/runs/${run.data.id}?token=${APIFY_API_KEY}`);
    
    if (!statusResponse.ok) {
      console.error('Failed to check Apify status:', statusResponse.status);
      throw new Error(`Failed to check Apify run status (${statusResponse.status})`);
    }

    const statusData = await statusResponse.json();
    status = statusData.data.status;
    console.log('Apify status check', attempts, '- Status:', status);
    
    if (status === 'SUCCEEDED') {
      const datasetId = statusData.data.defaultDatasetId;
      
      if (!datasetId) {
        console.warn('No dataset ID in successful run');
        return { status, data: [] };
      }

      const datasetResponse = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_API_KEY}`);
      
      if (!datasetResponse.ok) {
        console.error('Failed to fetch Apify dataset:', datasetResponse.status);
        throw new Error(`Failed to fetch Apify dataset (${datasetResponse.status})`);
      }

      dataset = await datasetResponse.json();
      console.log('Apify dataset fetched, items:', dataset?.length || 0);
    } else if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
      throw new Error(`Apify run ${status.toLowerCase()}`);
    }
  }

  if (attempts >= maxAttempts) {
    throw new Error('Apify run timed out after 3 minutes');
  }

  return { status, data: dataset };
}

async function generateSummary(userInput: string, results: any[]) {
  const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
  
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  console.log('Generating final summary...');
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-r1-0528:free',
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

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenRouter API error in summary:', response.status, errorText);
    throw new Error(`Failed to generate summary (${response.status}): ${errorText}`);
  }

  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    console.error('Failed to parse summary response:', parseError);
    throw new Error('Invalid JSON response from OpenRouter API');
  }

  if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
    console.error('Invalid summary response structure:', data);
    throw new Error('OpenRouter API returned invalid response for summary');
  }

  const summary = data.choices[0]?.message?.content;
  if (!summary) {
    throw new Error('OpenRouter API returned empty summary');
  }

  return summary;
}