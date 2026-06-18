import { Shield, LayoutDashboard, Users, BookOpen, HelpCircle, AlertTriangle, Megaphone } from "lucide-react";
import { Link, useLocation } from "wouter";

export function AdminSidebar() {
  const [location] = useLocation();

  const links = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/courses", label: "Courses", icon: BookOpen },
    { href: "/admin/quizzes", label: "Quizzes", icon: HelpCircle },
    { href: "/admin/threats", label: "Threats", icon: AlertTriangle },
    { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  ];

  return (
    <div className="w-64 border-r bg-card min-h-[calc(100vh-4rem)] flex-shrink-0 flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-sm font-semibold text-destructive uppercase tracking-wider">Command Center</h2>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const isActive = location === link.href || (location.startsWith(link.href + "/") && link.href !== "/admin");
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-primary/10 text-primary border-r-2 border-primary" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
