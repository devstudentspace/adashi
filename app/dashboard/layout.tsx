import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { Suspense } from "react";
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Users, 
  Wallet, 
  History, 
  Settings,
  Menu,
  UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserNav } from "@/components/user-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const isAdmin = user.user_metadata?.role === 'admin' || user.email?.includes('admin');

  const navItems = isAdmin 
    ? [
        { label: 'Overview', icon: LayoutDashboard, href: '/dashboard/admin' },
        { label: 'Members', icon: Users, href: '/dashboard/admin/members' },
        { label: 'Schemes', icon: Wallet, href: '/dashboard/admin/schemes' },
        { label: 'Settings', icon: Settings, href: '/dashboard/profile' },
      ]
    : [
        { label: 'My Savings', icon: LayoutDashboard, href: '/dashboard/member' },
        { label: 'History', icon: History, href: '/dashboard/member/history' },
        { label: 'Profile', icon: UserCircle, href: '/dashboard/profile' },
      ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <ShieldCheck className="h-6 w-6" />
          <span>Adashi</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <Link key={item.label} href={item.href}>
            <Button variant="ghost" className="w-full justify-start gap-3 px-3 py-6 text-base font-medium">
              <item.icon className="h-5 w-5" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t space-y-4">
         <ThemeSwitcher />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b px-6 md:hidden">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <ShieldCheck className="h-6 w-6" />
            <span>Adashi</span>
          </Link>
          <div className="flex items-center gap-2">
             <UserNav user={user} />
             <Sheet>
               <SheetTrigger asChild>
                 <Button variant="ghost" size="icon">
                   <Menu className="h-6 w-6" />
                 </Button>
               </SheetTrigger>
               <SheetContent side="left" className="p-0 w-64">
                 <SidebarContent />
               </SheetContent>
             </Sheet>
          </div>
        </header>

        {/* Dynamic Top Bar (Desktop) */}
        <header className="hidden md:flex h-16 items-center justify-end border-b px-8 gap-4">
           <div className="text-sm font-medium text-muted-foreground mr-auto">
              {isAdmin ? "Admin Portal" : "Member Portal"}
           </div>
           <div className="flex items-center gap-4">
              <UserNav user={user} />
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
           <div className="mx-auto max-w-6xl">
              {children}
           </div>
        </main>
      </div>
    </div>
  );
}