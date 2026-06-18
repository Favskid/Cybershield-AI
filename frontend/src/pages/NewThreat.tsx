import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { AlertTriangle, Loader2, ArrowLeft } from "lucide-react";
import { useCreateThreat, getListThreatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  link: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  imageUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function NewThreat() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createThreat = useCreateThreat();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "", link: "", imageUrl: "" },
  });

  const onSubmit = (values: FormValues) => {
    createThreat.mutate({
      data: {
        title: values.title,
        description: values.description,
        link: values.link || null,
        imageUrl: values.imageUrl || null,
      },
    }, {
      onSuccess: (threat) => {
        queryClient.invalidateQueries({ queryKey: getListThreatsQueryKey() });
        toast({ title: "Threat reported", description: "AI analysis complete. Viewing your report." });
        setLocation(`/threats/${threat.id}`);
      },
      onError: () => toast({ title: "Error", description: "Failed to submit threat report.", variant: "destructive" }),
    });
  };

  return (
    <MainLayout sidebar="user">
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/threats")} className="gap-1" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" /> Threat Reports
          </Button>
        </div>

        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-yellow-500" /> Report a Threat
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Describe the suspicious activity. Our AI will analyze it and provide a risk assessment.
          </p>
        </div>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Incident Details</CardTitle>
            <CardDescription>Provide as much detail as possible for accurate AI analysis.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Threat Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Suspicious phishing email received" data-testid="input-title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what happened, what you saw, and any other relevant details..."
                        className="min-h-[120px] resize-none"
                        data-testid="input-description"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Be specific — the more detail you provide, the better the AI analysis.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="link" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Suspicious Link (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://suspicious-site.example.com" data-testid="input-link" {...field} />
                    </FormControl>
                    <FormDescription>Include any suspicious URLs for AI analysis.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="imageUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Screenshot URL (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/screenshot.png" data-testid="input-imageUrl" {...field} />
                    </FormControl>
                    <FormDescription>Link to a screenshot of the suspicious content.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button type="submit" disabled={createThreat.isPending} className="w-full" data-testid="button-submit">
                  {createThreat.isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Analyzing with AI...</>
                  ) : "Submit Threat Report"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
