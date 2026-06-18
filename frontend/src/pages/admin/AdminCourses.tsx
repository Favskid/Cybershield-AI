import { useState } from "react";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import { useListCourses, useCreateCourse, useUpdateCourse, useDeleteCourse, getListCoursesQueryKey, type Course } from "@workspace/api-client-react";
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

const courseSchema = z.object({
  title: z.string().min(3, "Min 3 characters"),
  description: z.string().min(1, "Required"),
  content: z.string().min(1, "Required"),
  videoUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
});
type CourseForm = z.infer<typeof courseSchema>;

function CourseFormModal({ course, onClose }: { course?: Course; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();

  const form = useForm<CourseForm>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: course?.title ?? "",
      description: course?.description ?? "",
      content: course?.content ?? "",
      videoUrl: course?.videoUrl ?? "",
    },
  });

  const onSubmit = (values: CourseForm) => {
    const data = { ...values, videoUrl: values.videoUrl || null };
    if (course) {
      updateCourse.mutate({ courseId: course.id, data }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListCoursesQueryKey() }); toast({ title: "Course updated" }); onClose(); },
        onError: () => toast({ title: "Error", description: "Failed to update course", variant: "destructive" }),
      });
    } else {
      createCourse.mutate({ data }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListCoursesQueryKey() }); toast({ title: "Course created" }); onClose(); },
        onError: () => toast({ title: "Error", description: "Failed to create course", variant: "destructive" }),
      });
    }
  };

  const isPending = createCourse.isPending || updateCourse.isPending;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{course ? "Edit Course" : "New Course"}</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem><FormLabel>Title</FormLabel><FormControl><Input data-testid="input-course-title" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea className="min-h-[60px] resize-none" data-testid="input-course-description" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="content" render={({ field }) => (
              <FormItem><FormLabel>Content (Markdown supported)</FormLabel><FormControl><Textarea className="min-h-[160px] resize-none font-mono text-xs" data-testid="input-course-content" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="videoUrl" render={({ field }) => (
              <FormItem><FormLabel>Video URL (optional)</FormLabel><FormControl><Input placeholder="https://www.youtube.com/embed/..." data-testid="input-course-videoUrl" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={isPending} data-testid="button-save-course">
                {isPending ? "Saving..." : (course ? "Update" : "Create")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminCourses() {
  const { data: courses, isLoading } = useListCourses({ query: { queryKey: getListCoursesQueryKey() } });
  const deleteCourse = useDeleteCourse();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editCourse, setEditCourse] = useState<Course | null | "new">(null);
  const [deleteCourseId, setDeleteCourseId] = useState<number | null>(null);

  const handleDelete = () => {
    if (!deleteCourseId) return;
    deleteCourse.mutate({ courseId: deleteCourseId }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListCoursesQueryKey() }); toast({ title: "Course deleted" }); setDeleteCourseId(null); },
      onError: () => toast({ title: "Error", description: "Failed to delete course", variant: "destructive" }),
    });
  };

  return (
    <MainLayout sidebar="admin">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Courses</h1>
            <p className="text-muted-foreground text-sm mt-1">Create and manage cybersecurity courses.</p>
          </div>
          <Button className="gap-2" onClick={() => setEditCourse("new")} data-testid="button-new-course">
            <Plus className="h-4 w-4" /> New Course
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20" />)}</div>
        ) : courses && courses.length > 0 ? (
          <div className="space-y-3">
            {courses.map((c) => (
              <Card key={c.id} className="border-border/50" data-testid={`card-admin-course-${c.id}`}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{c.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{c.description}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => setEditCourse(c)} data-testid={`button-edit-course-${c.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteCourseId(c.id)} data-testid={`button-delete-course-${c.id}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="mb-3">No courses yet. Create your first course.</p>
            <Button onClick={() => setEditCourse("new")}>Create Course</Button>
          </div>
        )}

        {editCourse !== null && (
          <CourseFormModal course={editCourse === "new" ? undefined : editCourse} onClose={() => setEditCourse(null)} />
        )}

        <AlertDialog open={!!deleteCourseId} onOpenChange={() => setDeleteCourseId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Course</AlertDialogTitle>
              <AlertDialogDescription>This will permanently delete the course and all its quizzes and progress data.</AlertDialogDescription>
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
