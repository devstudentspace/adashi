'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, ShieldCheck, LayoutDashboard, Users, Wallet, History, Settings, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  icon: string; // Icon name as string
  href: string;
}

interface MobileNavMenuProps {
  navItems: NavItem[];
  isAdmin: boolean;
}

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

export function MobileNavMenu({ navItems, isAdmin }: MobileNavMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="flex flex-col h-full">
          <div className="flex h-16 items-center border-b px-6">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl text-primary"
              onClick={handleClose}
            >
              <ShieldCheck className="h-6 w-6" />
              <span>Adashi</span>
            </Link>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const IconComponent = getIcon(item.icon);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={handleClose}
                >
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
      </SheetContent>
    </Sheet>
  );
}