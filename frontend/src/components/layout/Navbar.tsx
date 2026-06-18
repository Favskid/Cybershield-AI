import { Shield } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b bg-card">
      <div className="flex h-16 items-center px-4 md:px-6 justify-between max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
          <Shield className="h-6 w-6" />
          CyberShield
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground hidden md:inline-block">
                {user.fullName}
              </span>
              <Link href={user.role === "ADMIN" ? "/admin" : "/dashboard"} className="text-sm font-medium hover:text-primary transition-colors">
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
