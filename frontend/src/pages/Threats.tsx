import { AlertTriangle, Plus, ChevronRight } from "lucide-react";
import { useListThreats, getListThreatsQueryKey } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

function riskBadge(level: string) {
  const map: Record<string, string> = {
    LOW: "bg-green-500/20 text-green-400 border-green-500/30",
    MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    HIGH: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return <Badge className={map[level] || ""}>{level}</Badge>;
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    REVIEWED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    RESOLVED: "bg-green-500/20 text-green-400 border-green-500/30",
  };
  return <Badge className={map[status] || ""}>{status}</Badge>;
}

export default function Threats() {
  const { data: threats, isLoading } = useListThreats({ query: { queryKey: getListThreatsQueryKey() } });

  return (
    <MainLayout sidebar="user">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Threat Reports</h1>
            <p className="text-muted-foreground text-sm mt-1">Your submitted cybersecurity incident reports.</p>
          </div>
          <Link href="/threats/new">
            <Button className="flex items-center gap-2" data-testid="button-new-threat">
              <Plus className="h-4 w-4" /> Report Threat
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
        ) : threats && threats.length > 0 ? (
          <div className="space-y-3">
            {threats.map((threat) => (
              <Card key={threat.id} className="border-border/50 hover:border-primary/30 transition-colors" data-testid={`card-threat-${threat.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-medium text-sm">{threat.title}</h3>
                        {riskBadge(threat.riskLevel)}
                        {statusBadge(threat.status)}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{threat.description}</p>
                      <p className="text-xs text-muted-foreground">{new Date(threat.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Link href={`/threats/${threat.id}`}>
                      <Button size="sm" variant="ghost" className="shrink-0" data-testid={`button-view-threat-${threat.id}`}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <AlertTriangle className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="mb-3">No threat reports yet. Submit your first report.</p>
            <Link href="/threats/new"><Button variant="outline">Report a Threat</Button></Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
