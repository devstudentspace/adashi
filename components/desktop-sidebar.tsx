'use client';

import { Button } from '@/components/ui/button';
import { ShieldCheck, LayoutDashboard, Users, Wallet, History, Settings, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DesktopSidebarProps {
  isAdmin: boolean;
}

export function DesktopSidebar({ isAdmin }: DesktopSidebarProps) {
  const pathname = usePathname();

  // Icon mapping function
  function getIcon(iconName: string) {
    switch(iconName) {
      case 'LayoutDashboard': return LayoutDashboard;
      case 'Users': return Users;
      case 'Wallet': return Wallet;
      case 'History': return History;
      case 'Settings': return Settings;
      case 'UserCircle': return UserCircle;
      default: return LayoutDashboard; // default fallback
    }
  }

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
    <div className="flex flex-col h-full">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <ShieldCheck className="h-6 w-6" />
          <span>Adashi</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const IconComponent = getIcon(item.icon);
          return (
            <Link key={item.label} href={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 px-3 py-6 text-base font-medium ${
                  pathname === item.href ? 'bg-accent' : ''
                }`}
              >
                <IconComponent className="h-5 w-5" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}