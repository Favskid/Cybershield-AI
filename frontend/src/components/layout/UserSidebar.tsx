import { Shield, LayoutDashboard, BookOpen, Target, AlertTriangle, User } from "lucide-react";
import { Link, useLocation } from "wouter";

export function UserSidebar() {
  const [location] = useLocation();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/courses", label: "Courses", icon: BookOpen },
    { href: "/progress", label: "My Progress", icon: Target },
    { href: "/threats", label: "Threat Reports", icon: AlertTriangle },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="w-64 border-r bg-card min-h-[calc(100vh-4rem)] flex-shrink-0 flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">User Portal</h2>
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
    </div>
  );
}
