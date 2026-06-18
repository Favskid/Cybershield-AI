import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { CheckCircle, XCircle, HelpCircle, ArrowLeft } from "lucide-react";
import { useListQuizzesByCourse, useSubmitQuiz, getListQuizzesByCourseQueryKey, getGetMyProgressQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

type Answer = { quizId: number; answer: "A" | "B" | "C" | "D" };

export default function Quiz() {
  const { id } = useParams<{ id: string }>();
  const courseId = parseInt(id || "0");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: questions, isLoading } = useListQuizzesByCourse(courseId, {
    query: { enabled: !!courseId, queryKey: getListQuizzesByCourseQueryKey(courseId) },
  });

  const submitMutation = useSubmitQuiz();
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [result, setResult] = useState<{ score: number; total: number; passed: boolean } | null>(null);

  const handleAnswer = (quizId: number, answer: "A" | "B" | "C" | "D") => {
    setAnswers((prev) => {
      const existing = prev.find((a) => a.quizId === quizId);
      if (existing) return prev.map((a) => a.quizId === quizId ? { ...a, answer } : a);
      return [...prev, { quizId, answer }];
    });
  };

  const answered = answers.length;
  const total = questions?.length ?? 0;

  const handleSubmit = () => {
    if (answered < total) {
      toast({ title: "Incomplete", description: "Please answer all questions before submitting.", variant: "destructive" });
      return;
    }
    submitMutation.mutate(
      { courseId, data: { answers } },
      {
        onSuccess: (res) => {
          setResult({ score: res.score, total: res.total, passed: res.passed });
          queryClient.invalidateQueries({ queryKey: getGetMyProgressQueryKey() });
        },
        onError: () => toast({ title: "Error", description: "Failed to submit quiz. Try again.", variant: "destructive" }),
      }
    );
  };

  if (isLoading) {
    return <MainLayout sidebar="user"><div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32" />)}</div></MainLayout>;
  }

  if (result) {
    return (
      <MainLayout sidebar="user">
        <div className="max-w-lg mx-auto text-center py-10 space-y-6">
          <div className={`h-20 w-20 rounded-full mx-auto flex items-center justify-center ${result.passed ? "bg-green-500/10" : "bg-destructive/10"}`}>
            {result.passed
              ? <CheckCircle className="h-10 w-10 text-green-500" />
              : <XCircle className="h-10 w-10 text-destructive" />}
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1" data-testid="text-quiz-result">{result.passed ? "Quiz Passed!" : "Quiz Failed"}</h2>
            <p className="text-muted-foreground">{result.passed ? "Great work! Course marked as completed." : "Score below 60%. Review the material and try again."}</p>
          </div>
          <div className="text-4xl font-bold text-primary">{result.score}%</div>
          <p className="text-sm text-muted-foreground">You answered {Math.round(result.score / 100 * result.total)} out of {result.total} questions correctly.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => { setResult(null); setAnswers([]); }} data-testid="button-retake">Retake Quiz</Button>
            <Button onClick={() => setLocation(`/courses/${courseId}`)} data-testid="button-back-course">Back to Course</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout sidebar="user">
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setLocation(`/courses/${courseId}`)} className="gap-1" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" /> Back to Course
          </Button>
        </div>

        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" /> Course Quiz
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{answered} of {total} answered</p>
          <Progress value={total > 0 ? (answered / total) * 100 : 0} className="mt-2 h-1.5" />
        </div>

        {questions && questions.length > 0 ? (
          <div className="space-y-4">
            {questions.map((q, idx) => {
              const selected = answers.find((a) => a.quizId === q.id)?.answer;
              const options = [
                { key: "A" as const, label: q.optionA },
                { key: "B" as const, label: q.optionB },
                { key: "C" as const, label: q.optionC },
                { key: "D" as const, label: q.optionD },
              ];
              return (
                <Card key={q.id} className="border-border/50" data-testid={`card-question-${q.id}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      <span className="text-primary mr-2">Q{idx + 1}.</span>{q.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {options.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => handleAnswer(q.id, opt.key)}
                        data-testid={`option-${q.id}-${opt.key}`}
                        className={`w-full text-left px-4 py-2.5 rounded-md border text-sm transition-all ${
                          selected === opt.key
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/50 bg-muted/20 hover:border-primary/40 hover:bg-muted/50"
                        }`}
                      >
                        <span className="font-medium mr-2">{opt.key}.</span>{opt.label}
                      </button>
                    ))}
                  </CardContent>
                </Card>
              );
            })}

            <Button
              onClick={handleSubmit}
              disabled={submitMutation.isPending || answered < total}
              className="w-full"
              data-testid="button-submit-quiz"
            >
              {submitMutation.isPending ? "Submitting..." : `Submit Quiz (${answered}/${total} answered)`}
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-10">No quiz questions found for this course.</p>
        )}
      </div>
    </MainLayout>
  );
}
