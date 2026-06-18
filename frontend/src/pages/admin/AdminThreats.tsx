import { useState } from "react";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { useListAdminThreats, useUpdateThreatStatus, getListAdminThreatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

function riskBadge(level: string) {
  const map: Record<string, string> = {
    LOW: "bg-green-500/20 text-green-400 border-green-500/30",
    MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    HIGH: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return <Badge className={`text-xs ${map[level] || ""}`}>{level}</Badge>;
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    REVIEWED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    RESOLVED: "bg-green-500/20 text-green-400 border-green-500/30",
  };
  return <Badge className={`text-xs ${map[status] || ""}`}>{status}</Badge>;
}

export default function AdminThreats() {
  const { data: threats, isLoading } = useListAdminThreats({ query: { queryKey: getListAdminThreatsQueryKey() } });
  const updateStatus = useUpdateThreatStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedThreat, setSelectedThreat] = useState<typeof threats extends Array<infer T> ? T : never | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = threats?.filter((t) => statusFilter === "ALL" || t.status === statusFilter);

  const handleStatusChange = (threatId: number, status: string) => {
    updateStatus.mutate({ threatId, data: { status: status as "PENDING" | "REVIEWED" | "RESOLVED" } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListAdminThreatsQueryKey() }); toast({ title: "Status updated" }); },
      onError: () => toast({ title: "Error", description: "Failed to update status", variant: "destructive" }),
    });
  };

  return (
    <MainLayout sidebar="admin">
      <div className="space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Threat Reports</h1>
            <p className="text-muted-foreground text-sm mt-1">Review AI-analyzed threat reports from users.</p>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40" data-testid="select-status-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Reports</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="REVIEWED">Reviewed</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}</div>
        ) : filtered && filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((threat) => (
              <Card key={threat.id} className="border-border/50 hover:border-primary/20 transition-colors" data-testid={`card-admin-threat-${threat.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-medium text-sm">{threat.title}</p>
                        {riskBadge(threat.riskLevel)}
                        {statusBadge(threat.status)}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-1">{threat.description}</p>
                      <p className="text-xs text-muted-foreground">
                        by <strong>{threat.user?.fullName}</strong> ({threat.user?.email}) · {new Date(threat.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Select value={threat.status} onValueChange={(v) => handleStatusChange(threat.id, v)}>
                        <SelectTrigger className="w-36 h-8 text-xs" data-testid={`select-threat-status-${threat.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="REVIEWED">Reviewed</SelectItem>
                          <SelectItem value="RESOLVED">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="outline" onClick={() => setSelectedThreat(threat as any)} data-testid={`button-view-threat-${threat.id}`}>
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>No threat reports {statusFilter !== "ALL" ? `with status ${statusFilter}` : "yet"}.</p>
          </div>
        )}

        {selectedThreat && (
          <Dialog open onOpenChange={() => setSelectedThreat(null)}>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{(selectedThreat as any).title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {riskBadge((selectedThreat as any).riskLevel)}
                  {statusBadge((selectedThreat as any).status)}
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{(selectedThreat as any).description}</p>
                </div>
                {(selectedThreat as any).link && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Suspicious Link</p>
                    <a href={(selectedThreat as any).link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">{(selectedThreat as any).link}</a>
                  </div>
                )}
                <Separator />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">AI Analysis</p>
                  <div className="p-3 rounded-md bg-muted/30 border border-border/50 text-sm whitespace-pre-wrap text-muted-foreground">
                    {(selectedThreat as any).aiAnalysis}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Update Status</p>
                  <Select value={(selectedThreat as any).status} onValueChange={(v) => { handleStatusChange((selectedThreat as any).id, v); setSelectedThreat(null); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="REVIEWED">Reviewed</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  );
}
