import { useParams, useLocation } from "wouter";
import { ArrowLeft, AlertTriangle, Shield, Link2 } from "lucide-react";
import { useGetThreat, getGetThreatQueryKey } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function riskBadge(level: string) {
  const map: Record<string, string> = {
    LOW: "bg-green-500/20 text-green-400 border-green-500/30",
    MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    HIGH: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return <Badge className={`text-sm px-3 py-1 ${map[level] || ""}`}>{level} RISK</Badge>;
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    REVIEWED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    RESOLVED: "bg-green-500/20 text-green-400 border-green-500/30",
  };
  return <Badge className={map[status] || ""}>{status}</Badge>;
}

export default function ThreatDetail() {
  const { id } = useParams<{ id: string }>();
  const threatId = parseInt(id || "0");
  const [, setLocation] = useLocation();
  const { data: threat, isLoading } = useGetThreat(threatId, {
    query: { enabled: !!threatId, queryKey: getGetThreatQueryKey(threatId) },
  });

  if (isLoading) {
    return <MainLayout sidebar="user"><div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 w-full" />)}</div></MainLayout>;
  }

  if (!threat) {
    return (
      <MainLayout sidebar="user">
        <div className="text-center py-16 text-muted-foreground">
          <p>Threat report not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => setLocation("/threats")}>Back</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout sidebar="user">
      <div className="space-y-6 max-w-2xl">
        <div>
          <Button variant="ghost" size="sm" onClick={() => setLocation("/threats")} className="gap-1" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" /> Threat Reports
          </Button>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {riskBadge(threat.riskLevel)}
            {statusBadge(threat.status)}
          </div>
          <h1 className="text-2xl font-bold" data-testid="text-threat-title">{threat.title}</h1>
          <p className="text-xs text-muted-foreground mt-1">Submitted {new Date(threat.createdAt).toLocaleString()}</p>
        </div>

        <Card className="border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-yellow-500" /> Incident Description</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-threat-description">{threat.description}</p>
            {threat.link && (
              <div className="mt-3 flex items-center gap-2 text-xs">
                <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                <a href={threat.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-sm">{threat.link}</a>
              </div>
            )}
            {threat.imageUrl && (
              <div className="mt-3">
                <img src={threat.imageUrl} alt="Screenshot" className="rounded-md border border-border/50 max-h-60 object-contain" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap" data-testid="text-ai-analysis">
              {threat.aiAnalysis}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
