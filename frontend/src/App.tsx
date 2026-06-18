import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Courses from "@/pages/Courses";
import CourseDetail from "@/pages/CourseDetail";
import Quiz from "@/pages/Quiz";
import Progress from "@/pages/Progress";
import Threats from "@/pages/Threats";
import NewThreat from "@/pages/NewThreat";
import ThreatDetail from "@/pages/ThreatDetail";
import Profile from "@/pages/Profile";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminCourses from "@/pages/admin/AdminCourses";
import AdminQuizzes from "@/pages/admin/AdminQuizzes";
import AdminThreats from "@/pages/admin/AdminThreats";
import AdminAnnouncements from "@/pages/admin/AdminAnnouncements";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function ProtectedRoute({ component: Component, adminOnly = false }: { component: React.ComponentType; adminOnly?: boolean }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Redirect to="/login" />;
  if (adminOnly && user.role !== "ADMIN") return <Redirect to="/dashboard" />;

  return <Component />;
}

function GuestRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return <Redirect to={user.role === "ADMIN" ? "/admin" : "/dashboard"} />;

  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Landing} />
      <Route path="/login">
        {() => <GuestRoute component={Login} />}
      </Route>
      <Route path="/register">
        {() => <GuestRoute component={Register} />}
      </Route>

      {/* User routes */}
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/courses">
        {() => <ProtectedRoute component={Courses} />}
      </Route>
      <Route path="/courses/:id/quiz">
        {() => <ProtectedRoute component={Quiz} />}
      </Route>
      <Route path="/courses/:id">
        {() => <ProtectedRoute component={CourseDetail} />}
      </Route>
      <Route path="/progress">
        {() => <ProtectedRoute component={Progress} />}
      </Route>
      <Route path="/threats/new">
        {() => <ProtectedRoute component={NewThreat} />}
      </Route>
      <Route path="/threats/:id">
        {() => <ProtectedRoute component={ThreatDetail} />}
      </Route>
      <Route path="/threats">
        {() => <ProtectedRoute component={Threats} />}
      </Route>
      <Route path="/profile">
        {() => <ProtectedRoute component={Profile} />}
      </Route>

      {/* Admin routes */}
      <Route path="/admin">
        {() => <ProtectedRoute component={AdminDashboard} adminOnly />}
      </Route>
      <Route path="/admin/users">
        {() => <ProtectedRoute component={AdminUsers} adminOnly />}
      </Route>
      <Route path="/admin/courses">
        {() => <ProtectedRoute component={AdminCourses} adminOnly />}
      </Route>
      <Route path="/admin/quizzes">
        {() => <ProtectedRoute component={AdminQuizzes} adminOnly />}
      </Route>
      <Route path="/admin/threats">
        {() => <ProtectedRoute component={AdminThreats} adminOnly />}
      </Route>
      <Route path="/admin/announcements">
        {() => <ProtectedRoute component={AdminAnnouncements} adminOnly />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
