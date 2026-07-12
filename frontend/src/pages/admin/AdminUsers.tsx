import { useState } from "react";
import { Users, Trash2, ChevronRight, Search, ShieldCheck, ShieldOff } from "lucide-react";
import { useListUsers, useDeleteUser, useUpdateUserRole, useGetUserProgress, getListUsersQueryKey, getGetUserProgressQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

function UserProgressModal({ userId, onClose }: { userId: number; onClose: () => void }) {
  const { data: progress, isLoading } = useGetUserProgress(userId, {
    query: { enabled: !!userId, queryKey: getGetUserProgressQueryKey(userId) },
  });
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>User Progress</DialogTitle></DialogHeader>
        {isLoading ? (
          <div className="space-y-2">{[1,2].map(i => <Skeleton key={i} className="h-16" />)}</div>
        ) : progress && progress.length > 0 ? (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {progress.map((p) => (
              <div key={p.id} className="p-3 rounded-md bg-muted/30 border border-border/50">
                <p className="text-sm font-medium">{p.course?.title ?? `Course #${p.courseId}`}</p>
                <div className="flex items-center gap-3 mt-1">
                  {p.score != null && <span className="text-xs text-muted-foreground">Score: <strong>{p.score}%</strong></span>}
                  <Badge className={p.completed ? "bg-green-500/20 text-green-400 border-green-500/30 text-xs" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs"}>
                    {p.completed ? "Completed" : "In Progress"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-muted-foreground py-4 text-center">No progress recorded.</p>}
      </DialogContent>
    </Dialog>
  );
}

export default function AdminUsers() {
  const { data: users, isLoading } = useListUsers({ query: { queryKey: getListUsersQueryKey() } });
  const deleteUser = useDeleteUser();
  const updateUserRole = useUpdateUserRole();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [progressUserId, setProgressUserId] = useState<number | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [roleChangeTarget, setRoleChangeTarget] = useState<{ id: number; fullName: string; role: "USER" | "ADMIN" } | null>(null);

  const filtered = users?.filter(u =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = () => {
    if (!deleteUserId) return;
    deleteUser.mutate({ userId: deleteUserId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
        toast({ title: "User deleted" });
        setDeleteUserId(null);
      },
      onError: () => toast({ title: "Error", description: "Failed to delete user", variant: "destructive" }),
    });
  };

  const handleRoleChange = () => {
    if (!roleChangeTarget) return;
    const newRole = roleChangeTarget.role === "ADMIN" ? "USER" : "ADMIN";
    updateUserRole.mutate({ userId: roleChangeTarget.id, data: { role: newRole } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
        toast({
          title: newRole === "ADMIN" ? "Promoted to Admin" : "Demoted to User",
          description: `${roleChangeTarget.fullName} is now ${newRole === "ADMIN" ? "an admin" : "a regular user"}.`,
        });
        setRoleChangeTarget(null);
      },
      onError: (err: unknown) => {
        const message = (err as { data?: { error?: string } })?.data?.error || "Failed to update role";
        toast({ title: "Error", description: message, variant: "destructive" });
        setRoleChangeTarget(null);
      },
    });
  };

  return (
    <MainLayout sidebar="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground text-sm mt-1">View and manage all registered users.</p>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search"
          />
        </div>

        {isLoading ? (
          <div className="space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-16" />)}</div>
        ) : (
          <Card className="border-border/50">
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {filtered && filtered.length > 0 ? filtered.map((u) => (
                  <div key={u.id} className="p-4 flex items-center gap-3" data-testid={`row-user-${u.id}`}>
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {u.fullName[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{u.fullName}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0">{u.role}</Badge>
                    <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        className={u.role === "ADMIN" ? "text-yellow-500 hover:text-yellow-600" : "text-primary hover:text-primary/80"}
                        onClick={() => setRoleChangeTarget({ id: u.id, fullName: u.fullName, role: u.role })}
                        disabled={u.id === currentUser?.id}
                        title={u.id === currentUser?.id ? "Cannot change your own role" : u.role === "ADMIN" ? "Demote to User" : "Promote to Admin"}
                        data-testid={`button-role-${u.id}`}
                      >
                        {u.role === "ADMIN" ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setProgressUserId(u.id)} data-testid={`button-progress-${u.id}`}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteUserId(u.id)} data-testid={`button-delete-user-${u.id}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p>No users found.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {progressUserId && <UserProgressModal userId={progressUserId} onClose={() => setProgressUserId(null)} />}

        <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User</AlertDialogTitle>
              <AlertDialogDescription>This will permanently delete the user and all their data. This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!roleChangeTarget} onOpenChange={() => setRoleChangeTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {roleChangeTarget?.role === "ADMIN" ? "Demote to User" : "Promote to Admin"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {roleChangeTarget?.role === "ADMIN"
                  ? `Remove admin privileges from ${roleChangeTarget?.fullName}? They will lose access to all admin areas.`
                  : `Grant admin privileges to ${roleChangeTarget?.fullName}? They will have full access to all admin areas.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRoleChange}
                className={roleChangeTarget?.role === "ADMIN" ? "bg-destructive hover:bg-destructive/90" : ""}
              >
                {roleChangeTarget?.role === "ADMIN" ? "Demote" : "Promote"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
