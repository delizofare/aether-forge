import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Play, Volume2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Agent = () => {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [result, setResult] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!input.trim()) {
      toast({
        title: "Input required",
        description: "Please enter a task for the agent to execute",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setResult("");
    setSteps([]);

    try {
      // Create task record
      const { data: task, error: taskError } = await supabase
        .from("tasks")
        .insert({
          title: input.substring(0, 100),
          description: input,
          status: "pending"
        })
        .select()
        .single();

      if (taskError) throw taskError;
      setCurrentTask(task);

      // Subscribe to execution steps
      const subscription = supabase
        .channel(`task-${task.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'execution_steps',
            filter: `task_id=eq.${task.id}`
          },
          (payload) => {
            setSteps(prev => [...prev, payload.new]);
          }
        )
        .subscribe();

      // Call orchestrator
      const { data, error } = await supabase.functions.invoke('agent-orchestrator', {
        body: {
          taskId: task.id,
          userInput: input
        }
      });

      if (error) throw error;

      setResult(data.summary);
      
      toast({
        title: "Task completed!",
        description: "The agent has finished executing your task"
      });

      subscription.unsubscribe();
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudio = async () => {
    if (!result) return;
    
    setIsPlaying(true);
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: result }
      });

      if (error) throw error;

      const audioBlob = new Blob([data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => setIsPlaying(false);
      audio.play();
    } catch (error: any) {
      console.error('Error playing audio:', error);
      toast({
        title: "Audio error",
        description: error.message,
        variant: "destructive"
      });
      setIsPlaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Autonomous AI Agent</h1>
            <p className="text-muted-foreground text-lg">
              Tell the agent what you need. It will plan, search, scrape, and automate to get it done.
            </p>
          </div>

          <Card className="p-6 space-y-4">
            <Textarea
              placeholder="Example: Find the top 5 AI companies, get their latest funding rounds, and summarize their recent news..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-32"
              disabled={isProcessing}
            />
            
            <Button 
              onClick={handleSubmit} 
              disabled={isProcessing || !input.trim()}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Execute Task
                </>
              )}
            </Button>
          </Card>

          {steps.length > 0 && (
            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">Execution Steps</h2>
              <div className="space-y-3">
                {steps.map((step, idx) => (
                  <div key={step.id} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Step {idx + 1}: {step.tool_name}</span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        step.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                        step.status === 'failed' ? 'bg-red-500/20 text-red-500' :
                        'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {step.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {result && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Result</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={playAudio}
                  disabled={isPlaying}
                >
                  {isPlaying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="prose max-w-none">
                <p className="text-foreground whitespace-pre-wrap">{result}</p>
              </div>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Agent;