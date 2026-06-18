import { useState } from "react";
import { Plus, Pencil, Trash2, HelpCircle } from "lucide-react";
import {
  useListCourses, useListQuizzesByCourse, useCreateQuiz, useUpdateQuiz, useDeleteQuiz,
  getListCoursesQueryKey, getListQuizzesByCourseQueryKey, type Quiz
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const quizSchema = z.object({
  question: z.string().min(5, "Min 5 characters"),
  optionA: z.string().min(1, "Required"),
  optionB: z.string().min(1, "Required"),
  optionC: z.string().min(1, "Required"),
  optionD: z.string().min(1, "Required"),
  correctAnswer: z.enum(["A", "B", "C", "D"]),
});
type QuizForm = z.infer<typeof quizSchema>;

function QuizFormModal({ quiz, courseId, onClose }: { quiz?: Quiz; courseId: number; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createQuiz = useCreateQuiz();
  const updateQuiz = useUpdateQuiz();

  const form = useForm<QuizForm>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      question: quiz?.question ?? "",
      optionA: quiz?.optionA ?? "",
      optionB: quiz?.optionB ?? "",
      optionC: quiz?.optionC ?? "",
      optionD: quiz?.optionD ?? "",
      correctAnswer: (quiz?.correctAnswer as "A" | "B" | "C" | "D") ?? "A",
    },
  });

  const onSubmit = (values: QuizForm) => {
    if (quiz) {
      updateQuiz.mutate({ quizId: quiz.id, data: values }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListQuizzesByCourseQueryKey(courseId) }); toast({ title: "Quiz updated" }); onClose(); },
        onError: () => toast({ title: "Error", description: "Failed to update quiz", variant: "destructive" }),
      });
    } else {
      createQuiz.mutate({ data: { ...values, courseId } }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListQuizzesByCourseQueryKey(courseId) }); toast({ title: "Quiz created" }); onClose(); },
        onError: () => toast({ title: "Error", description: "Failed to create quiz", variant: "destructive" }),
      });
    }
  };

  const isPending = createQuiz.isPending || updateQuiz.isPending;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{quiz ? "Edit Question" : "New Question"}</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField control={form.control} name="question" render={({ field }) => (
              <FormItem><FormLabel>Question</FormLabel><FormControl><Input data-testid="input-question" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            {(["A", "B", "C", "D"] as const).map((opt) => (
              <FormField key={opt} control={form.control} name={`option${opt}` as "optionA" | "optionB" | "optionC" | "optionD"} render={({ field }) => (
                <FormItem><FormLabel>Option {opt}</FormLabel><FormControl><Input data-testid={`input-option${opt}`} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            ))}
            <FormField control={form.control} name="correctAnswer" render={({ field }) => (
              <FormItem>
                <FormLabel>Correct Answer</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger data-testid="select-correctAnswer"><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {["A","B","C","D"].map(v => <SelectItem key={v} value={v}>Option {v}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={isPending} data-testid="button-save-quiz">{isPending ? "Saving..." : (quiz ? "Update" : "Create")}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminQuizzes() {
  const { data: courses } = useListCourses({ query: { queryKey: getListCoursesQueryKey() } });
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const { data: quizzes, isLoading } = useListQuizzesByCourse(selectedCourseId ?? 0, {
    query: { enabled: !!selectedCourseId, queryKey: getListQuizzesByCourseQueryKey(selectedCourseId ?? 0) },
  });
  const deleteQuiz = useDeleteQuiz();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editQuiz, setEditQuiz] = useState<Quiz | null | "new">(null);
  const [deleteQuizId, setDeleteQuizId] = useState<number | null>(null);

  const handleDelete = () => {
    if (!deleteQuizId || !selectedCourseId) return;
    deleteQuiz.mutate({ quizId: deleteQuizId }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListQuizzesByCourseQueryKey(selectedCourseId) }); toast({ title: "Quiz deleted" }); setDeleteQuizId(null); },
      onError: () => toast({ title: "Error", description: "Failed to delete quiz", variant: "destructive" }),
    });
  };

  return (
    <MainLayout sidebar="admin">
      <div className="space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Quiz Management</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage quiz questions per course.</p>
          </div>
          {selectedCourseId && (
            <Button className="gap-2" onClick={() => setEditQuiz("new")} data-testid="button-new-quiz">
              <Plus className="h-4 w-4" /> New Question
            </Button>
          )}
        </div>

        {/* Course selector */}
        <div className="max-w-sm">
          <Select onValueChange={(v) => setSelectedCourseId(parseInt(v))}>
            <SelectTrigger data-testid="select-course">
              <SelectValue placeholder="Select a course to manage quizzes..." />
            </SelectTrigger>
            <SelectContent>
              {courses?.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {selectedCourseId && (
          <>
            {isLoading ? (
              <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
            ) : quizzes && quizzes.length > 0 ? (
              <div className="space-y-2">
                {quizzes.map((q, idx) => (
                  <Card key={q.id} className="border-border/50" data-testid={`card-quiz-${q.id}`}>
                    <CardContent className="p-4 flex items-start gap-3">
                      <span className="text-primary text-sm font-bold shrink-0">Q{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{q.question}</p>
                        <p className="text-xs text-muted-foreground mt-1">Answer: <strong className="text-green-400">Option {q.correctAnswer}</strong></p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button size="sm" variant="ghost" onClick={() => setEditQuiz(q)} data-testid={`button-edit-quiz-${q.id}`}><Pencil className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteQuizId(q.id)} data-testid={`button-delete-quiz-${q.id}`}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <HelpCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="mb-3">No questions yet for this course.</p>
                <Button onClick={() => setEditQuiz("new")}>Add First Question</Button>
              </div>
            )}
          </>
        )}

        {editQuiz !== null && selectedCourseId && (
          <QuizFormModal quiz={editQuiz === "new" ? undefined : editQuiz} courseId={selectedCourseId} onClose={() => setEditQuiz(null)} />
        )}

        <AlertDialog open={!!deleteQuizId} onOpenChange={() => setDeleteQuizId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Question</AlertDialogTitle>
              <AlertDialogDescription>This will permanently delete this quiz question.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
