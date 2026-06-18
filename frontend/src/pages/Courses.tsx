import { BookOpen, Clock, ChevronRight, PlayCircle } from "lucide-react";
import { useListCourses, getListCoursesQueryKey } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Courses() {
  const { data: courses, isLoading } = useListCourses({ query: { queryKey: getListCoursesQueryKey() } });

  return (
    <MainLayout sidebar="user">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Learning Center</h1>
          <p className="text-muted-foreground text-sm mt-1">Build your cybersecurity knowledge with structured courses.</p>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-36 w-full" />)}
          </div>
        ) : courses && courses.length > 0 ? (
          <div className="grid gap-4">
            {courses.map((course) => (
              <Card key={course.id} className="border-border/50 hover:border-primary/30 transition-colors" data-testid={`card-course-${course.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        {course.videoUrl && (
                          <Badge variant="secondary" className="text-xs flex items-center gap-1">
                            <PlayCircle className="h-3 w-3" /> Video
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-base mb-1">{course.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Added {new Date(course.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Link href={`/courses/${course.id}`}>
                      <Button size="sm" className="flex items-center gap-1 shrink-0" data-testid={`button-course-${course.id}`}>
                        View <ChevronRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No courses available yet. Check back soon.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
