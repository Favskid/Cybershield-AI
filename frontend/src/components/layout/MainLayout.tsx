import { Navbar } from "./Navbar";
import { UserSidebar } from "./UserSidebar";
import { AdminSidebar } from "./AdminSidebar";

export function MainLayout({ children, sidebar = "none" }: { children: React.ReactNode, sidebar?: "user" | "admin" | "none" }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex flex-1">
        {sidebar === "user" && <UserSidebar />}
        {sidebar === "admin" && <AdminSidebar />}
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
