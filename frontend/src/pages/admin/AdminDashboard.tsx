import { Users, BookOpen, AlertTriangle, CheckCircle, BarChart3, Clock } from "lucide-react";
import { useGetAdminStats, useGetRecentActivity, getGetAdminStatsQueryKey, getGetRecentActivityQueryKey } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

function riskBadge(level: string) {
  const map: Record<string, string> = {
    LOW: "bg-green-500/20 text-green-400 border-green-500/30",
    MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    HIGH: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return <Badge className={`text-xs ${map[level] || ""}`}>{level}</Badge>;
}

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetAdminStats({ query: { queryKey: getGetAdminStatsQueryKey() } });
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity({ query: { queryKey: getGetRecentActivityQueryKey() } });

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers, icon: Users, color: "text-primary" },
    { label: "Total Courses", value: stats?.totalCourses, icon: BookOpen, color: "text-blue-400" },
    { label: "Total Reports", value: stats?.totalThreats, icon: AlertTriangle, color: "text-yellow-500" },
    { label: "Pending Reports", value: stats?.pendingThreats, icon: Clock, color: "text-orange-400" },
    { label: "Resolved Reports", value: stats?.resolvedThreats, icon: CheckCircle, color: "text-green-500" },
    { label: "Avg Quiz Score", value: stats?.avgQuizScore != null ? `${Math.round(stats.avgQuizScore)}%` : "—", icon: BarChart3, color: "text-primary" },
  ];

  return (
    <MainLayout sidebar="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Command Center</h1>
          <p className="text-muted-foreground text-sm mt-1">Platform-wide overview and recent activity.</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((s) => (
            <Card key={s.label} className="border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className={`h-7 w-7 shrink-0 ${s.color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  {statsLoading ? <Skeleton className="h-6 w-12 mt-1" /> : (
                    <p className="text-xl font-bold" data-testid={`text-stat-${s.label.replace(/\s/g, "-").toLowerCase()}`}>{s.value ?? "—"}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent threats */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-yellow-500" /> Recent Threat Reports</span>
                <Link href="/admin/threats" className="text-xs text-primary hover:underline">View all</Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12" />)}</div>
              ) : activity?.recentThreats && activity.recentThreats.length > 0 ? (
                <div className="space-y-2">
                  {activity.recentThreats.map((t) => (
                    <Link key={t.id} href={`/admin/threats`}>
                      <div className="p-2.5 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer" data-testid={`row-recent-threat-${t.id}`}>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium truncate flex-1">{t.title}</p>
                          {riskBadge(t.riskLevel)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          by {t.user?.fullName} · {new Date(t.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">No threat reports yet.</p>}
            </CardContent>
          </Card>

          {/* Recent users */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Recent Users</span>
                <Link href="/admin/users" className="text-xs text-primary hover:underline">View all</Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12" />)}</div>
              ) : activity?.recentUsers && activity.recentUsers.length > 0 ? (
                <div className="space-y-2">
                  {activity.recentUsers.map((u) => (
                    <div key={u.id} className="p-2.5 rounded-md bg-muted/30 flex items-center gap-3" data-testid={`row-recent-user-${u.id}`}>
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                        {u.fullName[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{u.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">{u.role}</Badge>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">No users yet.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
