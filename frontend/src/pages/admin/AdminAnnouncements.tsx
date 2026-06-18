import { useState } from "react";
import { Plus, Trash2, Bell } from "lucide-react";
import { useListAnnouncements, useCreateAnnouncement, useDeleteAnnouncement, getListAnnouncementsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  title: z.string().min(3, "Min 3 characters"),
  message: z.string().min(5, "Min 5 characters"),
});
type FormValues = z.infer<typeof schema>;

export default function AdminAnnouncements() {
  const { data: announcements, isLoading } = useListAnnouncements({ query: { queryKey: getListAnnouncementsQueryKey() } });
  const createAnnouncement = useCreateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", message: "" },
  });

  const onSubmit = (values: FormValues) => {
    createAnnouncement.mutate({ data: values }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAnnouncementsQueryKey() });
        toast({ title: "Announcement posted" });
        form.reset();
        setShowForm(false);
      },
      onError: () => toast({ title: "Error", description: "Failed to post announcement", variant: "destructive" }),
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteAnnouncement.mutate({ announcementId: deleteId }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListAnnouncementsQueryKey() }); toast({ title: "Announcement deleted" }); setDeleteId(null); },
      onError: () => toast({ title: "Error", description: "Failed to delete announcement", variant: "destructive" }),
    });
  };

  return (
    <MainLayout sidebar="admin">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Announcements</h1>
            <p className="text-muted-foreground text-sm mt-1">Post cybersecurity tips and awareness messages.</p>
          </div>
          <Button className="gap-2" onClick={() => setShowForm(true)} data-testid="button-new-announcement">
            <Plus className="h-4 w-4" /> New Announcement
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20" />)}</div>
        ) : announcements && announcements.length > 0 ? (
          <div className="space-y-3">
            {announcements.map((ann) => (
              <Card key={ann.id} className="border-border/50" data-testid={`card-announcement-${ann.id}`}>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Bell className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{ann.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{ann.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(ann.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive shrink-0" onClick={() => setDeleteId(ann.id)} data-testid={`button-delete-announcement-${ann.id}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="mb-3">No announcements yet.</p>
            <Button onClick={() => setShowForm(true)}>Post Announcement</Button>
          </div>
        )}

        {/* Create dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>New Announcement</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Title</FormLabel><FormControl><Input data-testid="input-ann-title" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="message" render={({ field }) => (
                  <FormItem><FormLabel>Message</FormLabel><FormControl><Textarea className="min-h-[100px] resize-none" data-testid="input-ann-message" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button type="submit" disabled={createAnnouncement.isPending} data-testid="button-post-announcement">
                    {createAnnouncement.isPending ? "Posting..." : "Post"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
              <AlertDialogDescription>This will permanently remove the announcement.</AlertDialogDescription>
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
