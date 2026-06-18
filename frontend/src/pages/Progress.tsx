import { CheckCircle, Clock, BookOpen, BarChart3 } from "lucide-react";
import { useGetMyProgress, getGetMyProgressQueryKey } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Progress() {
  const { data: progress, isLoading } = useGetMyProgress({ query: { queryKey: getGetMyProgressQueryKey() } });

  const completed = progress?.filter((p) => p.completed) ?? [];
  const inProgress = progress?.filter((p) => !p.completed && p.score != null) ?? [];
  const scores = progress?.filter((p) => p.score != null).map((p) => p.score!) ?? [];
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  return (
    <MainLayout sidebar="user">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Progress</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your learning journey and quiz performance.</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-xl font-bold" data-testid="text-completed-count">{isLoading ? "—" : completed.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-500 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">In Progress</p>
                <p className="text-xl font-bold" data-testid="text-inprogress-count">{isLoading ? "—" : inProgress.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Average Score</p>
                <p className="text-xl font-bold" data-testid="text-avg-score">{isLoading ? "—" : avgScore > 0 ? `${avgScore}%` : "—"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress list */}
        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
        ) : progress && progress.length > 0 ? (
          <div className="space-y-3">
            {progress.map((p) => (
              <Card key={p.id} className="border-border/50" data-testid={`card-progress-${p.id}`}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{p.course?.title ?? `Course #${p.courseId}`}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {p.score != null && (
                        <span className="text-xs text-muted-foreground">Score: <strong>{p.score}%</strong></span>
                      )}
                      {p.completedAt && (
                        <span className="text-xs text-muted-foreground">
                          Completed {new Date(p.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={p.completed
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    }>
                      {p.completed ? "Completed" : "In Progress"}
                    </Badge>
                    <Link href={`/courses/${p.courseId}`}>
                      <Button size="sm" variant="ghost" data-testid={`button-view-course-${p.courseId}`}>View</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="mb-3">No progress yet. Start a course to track your learning.</p>
            <Link href="/courses"><Button variant="outline">Browse Courses</Button></Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
