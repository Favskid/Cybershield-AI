import { Shield, Menu, LayoutDashboard, BookOpen, Target, AlertTriangle, User as UserIcon, Users, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";

export function Navbar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const userLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/courses", label: "Courses", icon: BookOpen },
    { href: "/progress", label: "My Progress", icon: Target },
    { href: "/threats", label: "Threat Reports", icon: AlertTriangle },
    { href: "/profile", label: "Profile", icon: UserIcon },
  ];

  const adminLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/courses", label: "Courses", icon: BookOpen },
    { href: "/admin/quizzes", label: "Quizzes", icon: Target },
    { href: "/admin/threats", label: "Threat Reports", icon: AlertTriangle },
    { href: "/admin/announcements", label: "Announcements", icon: Settings },
  ];

  const links = user?.role === "ADMIN" ? adminLinks : userLinks;

  return (
    <nav className="border-b bg-card">
      <div className="flex h-16 items-center px-4 md:px-6 justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          {user && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden mr-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">Mobile navigation links</SheetDescription>
                <div className="p-4 border-b">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    {user.role === "ADMIN" ? "Admin Portal" : "User Portal"}
                  </h2>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                  {links.map((link) => {
                    const isActive = location === link.href || location.startsWith(link.href + "/");
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive 
                            ? "bg-primary/10 text-primary" 
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          )}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
            <Shield className="h-6 w-6" />
            <span className="hidden sm:inline-block">CyberShield</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground hidden md:inline-block">
                {user.fullName}
              </span>
              <Link href={user.role === "ADMIN" ? "/admin" : "/dashboard"} className="text-sm font-medium hover:text-primary transition-colors hidden sm:inline-block">
                Dashboard
              </Link>
              <Button variant="ghost" onClick={logout} size="sm">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
                Login
              </Link>
              <Link href="/register" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
