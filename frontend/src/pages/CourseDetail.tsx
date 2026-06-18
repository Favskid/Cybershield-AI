import { useParams, Link } from "wouter";
import { BookOpen, PlayCircle, HelpCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { useGetCourse, getGetCourseQueryKey } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const courseId = parseInt(id || "0");
  const { data: course, isLoading } = useGetCourse(courseId, { query: { enabled: !!courseId, queryKey: getGetCourseQueryKey(courseId) } });

  if (isLoading) {
    return (
      <MainLayout sidebar="user">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (!course) {
    return (
      <MainLayout sidebar="user">
        <div className="text-center py-16 text-muted-foreground">
          <p>Course not found.</p>
          <Link href="/courses"><Button variant="outline" className="mt-4">Back to Courses</Button></Link>
        </div>
      </MainLayout>
    );
  }

  const userProgress = course.userProgress as { score?: number | null; completed?: boolean; completedAt?: string | null } | null;

  return (
    <MainLayout sidebar="user">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/courses">
            <Button variant="ghost" size="sm" className="gap-1" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" /> Courses
            </Button>
          </Link>
        </div>

        <div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {course.videoUrl && (
                  <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                    <PlayCircle className="h-3 w-3" /> Video included
                  </Badge>
                )}
                {userProgress?.completed && (
                  <Badge className="flex items-center gap-1 text-xs bg-green-500/20 text-green-400 border-green-500/30">
                    <CheckCircle className="h-3 w-3" /> Completed
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold" data-testid="text-course-title">{course.title}</h1>
              <p className="text-muted-foreground text-sm mt-1">{course.description}</p>
            </div>
            {(course.quizCount ?? 0) > 0 && (
              <Link href={`/courses/${courseId}/quiz`}>
                <Button className="flex items-center gap-2 shrink-0" data-testid="button-take-quiz">
                  <HelpCircle className="h-4 w-4" />
                  {userProgress?.score != null ? `Retake Quiz (${userProgress.score}%)` : "Take Quiz"}
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Video */}
        {course.videoUrl && (
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <PlayCircle className="h-4 w-4 text-primary" /> Course Video
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video w-full rounded-md overflow-hidden bg-black">
                <iframe
                  src={course.videoUrl}
                  title={course.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" /> Course Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm prose-invert max-w-none" data-testid="text-course-content">
              {course.content.split("\n").map((line, i) => {
                if (line.startsWith("# ")) return <h1 key={i} className="text-xl font-bold mt-0 mb-3">{line.slice(2)}</h1>;
                if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-semibold mt-5 mb-2">{line.slice(3)}</h2>;
                if (line.startsWith("### ")) return <h3 key={i} className="text-base font-semibold mt-4 mb-1">{line.slice(4)}</h3>;
                if (line.startsWith("- **")) {
                  const parts = line.slice(2).split("**: ");
                  return <p key={i} className="text-sm text-muted-foreground ml-2 mb-1">• <strong>{parts[0].replace("**", "")}</strong>: {parts[1]}</p>;
                }
                if (line.startsWith("- ")) return <p key={i} className="text-sm text-muted-foreground ml-2 mb-1">• {line.slice(2)}</p>;
                if (/^\d+\./.test(line)) return <p key={i} className="text-sm text-muted-foreground ml-2 mb-1">{line}</p>;
                if (line.trim() === "") return <div key={i} className="h-2" />;
                return <p key={i} className="text-sm text-foreground/80 leading-relaxed mb-2">{line}</p>;
              })}
            </div>
          </CardContent>
        </Card>

        {(course.quizCount ?? 0) === 0 && (
          <p className="text-sm text-muted-foreground text-center">No quiz available for this course yet.</p>
        )}
      </div>
    </MainLayout>
  );
}
