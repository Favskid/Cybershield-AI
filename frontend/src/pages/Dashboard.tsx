import { BookOpen, CheckCircle, BarChart3, Bell, AlertTriangle } from "lucide-react";
import { useGetMyProgress, useListAnnouncements, getGetMyProgressQueryKey, getListAnnouncementsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: progress, isLoading: progressLoading } = useGetMyProgress({ query: { queryKey: getGetMyProgressQueryKey() } });
  const { data: announcements, isLoading: annLoading } = useListAnnouncements({ query: { queryKey: getListAnnouncementsQueryKey() } });

  const completedCount = progress?.filter((p) => p.completed).length ?? 0;
  const scores = progress?.filter((p) => p.score != null).map((p) => p.score!) ?? [];
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  return (
    <MainLayout sidebar="user">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-welcome">
            Welcome back, {user?.fullName?.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Here is your cybersecurity training overview.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Courses Enrolled</p>
                {progressLoading ? <Skeleton className="h-6 w-8 mt-1" /> : (
                  <p className="text-2xl font-bold" data-testid="text-enrolled-count">{progress?.length ?? 0}</p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Courses Completed</p>
                {progressLoading ? <Skeleton className="h-6 w-8 mt-1" /> : (
                  <p className="text-2xl font-bold" data-testid="text-completed-count">{completedCount}</p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Average Quiz Score</p>
                {progressLoading ? <Skeleton className="h-6 w-16 mt-1" /> : (
                  <p className="text-2xl font-bold" data-testid="text-avg-score">{avgScore > 0 ? `${avgScore}%` : "—"}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Announcements */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" /> Latest Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {annLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : announcements && announcements.length > 0 ? (
              <div className="space-y-3">
                {announcements.slice(0, 3).map((ann) => (
                  <div key={ann.id} className="p-3 rounded-md bg-muted/30 border border-border/50">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium" data-testid={`text-announcement-${ann.id}`}>{ann.title}</p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(ann.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{ann.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No announcements yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border-border/50 hover:border-primary/30 transition-colors">
            <CardContent className="p-5">
              <BookOpen className="h-7 w-7 text-primary mb-3" />
              <h3 className="font-semibold mb-1">Continue Learning</h3>
              <p className="text-xs text-muted-foreground mb-3">Explore cybersecurity courses and build your knowledge.</p>
              <Link href="/courses">
                <Button size="sm" variant="outline" data-testid="button-go-courses">Browse Courses</Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="border-border/50 hover:border-primary/30 transition-colors">
            <CardContent className="p-5">
              <AlertTriangle className="h-7 w-7 text-yellow-500 mb-3" />
              <h3 className="font-semibold mb-1">Report a Threat</h3>
              <p className="text-xs text-muted-foreground mb-3">Spotted something suspicious? Submit a threat report for AI analysis.</p>
              <Link href="/threats/new">
                <Button size="sm" variant="outline" data-testid="button-report-threat">Report Now</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
