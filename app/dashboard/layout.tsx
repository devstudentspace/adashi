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
import { UserNav } from "@/components/user-nav";
import { Skeleton } from "@/components/ui/skeleton";
import { MobileNavMenu } from "@/components/mobile-nav-menu";
import { DesktopSidebar } from "@/components/desktop-sidebar";

function NavSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
      <div className="flex-1 space-y-4 p-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
      <div className="p-4 border-t">
        <Skeleton className="h-8 w-8" />
      </div>
    </div>
  );
}

async function DashboardHeaderContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const isAdmin = Boolean(user.user_metadata?.role === 'admin' || user.email?.includes('admin'));

  // Define nav items for the mobile menu
  const navItems = isAdmin
    ? [
        { label: 'Overview', icon: 'LayoutDashboard', href: '/dashboard/admin' },
        { label: 'Members', icon: 'Users', href: '/dashboard/admin/members' },
        { label: 'Schemes', icon: 'Wallet', href: '/dashboard/admin/schemes' },
        { label: 'Transactions', icon: 'History', href: '/dashboard/admin/transactions' },
        { label: 'Settings', icon: 'Settings', href: '/dashboard/profile' },
      ]
    : [
        { label: 'My Savings', icon: 'LayoutDashboard', href: '/dashboard/member' },
        { label: 'History', icon: 'History', href: '/dashboard/member/history' },
        { label: 'Profile', icon: 'UserCircle', href: '/dashboard/profile' },
      ];

  return (
    <>
      {/* Mobile Header Parts */}
      <div className="flex md:hidden h-16 items-center justify-between w-full px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <ShieldCheck className="h-6 w-6" />
            <span>Adashi</span>
          </Link>
          <div className="flex items-center gap-2">
             <ThemeSwitcher />
             <UserNav user={user} />
             <MobileNavMenu navItems={navItems} isAdmin={isAdmin} />
          </div>
      </div>

      {/* Desktop Header Parts */}
      <div className="hidden md:flex h-16 items-center justify-end w-full px-8 gap-4 border-b">
           <div className="text-sm font-medium text-muted-foreground mr-auto">
              {isAdmin ? "Admin Portal" : "Member Portal"}
           </div>
           <div className="flex items-center gap-4">
              <ThemeSwitcher />
              <UserNav user={user} />
           </div>
      </div>
    </>
  );
}

function HeaderSkeleton() {
  return (
    <div className="h-16 flex items-center justify-between px-6 border-b">
       <Skeleton className="h-6 w-24 md:hidden" />
       <div className="ml-auto flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 md:hidden" />
       </div>
    </div>
  );
}

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

  const isAdmin = Boolean(user.user_metadata?.role === 'admin' || user.email?.includes('admin'));



  return (

    <div className="flex min-h-screen bg-background">

      {/* Desktop Sidebar */}

      <aside className="hidden md:flex w-64 flex-col border-r bg-card">
        <Suspense fallback={<NavSkeleton />}>
          <DesktopSidebar isAdmin={isAdmin} />
        </Suspense>
      </aside>



      {/* Main Content Area */}

      <div className="flex-1 flex flex-col">

        {/* Header */}

        <header>

          <Suspense fallback={<HeaderSkeleton />}>

            <DashboardHeaderContent />

          </Suspense>

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
