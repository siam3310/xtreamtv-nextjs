"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clapperboard, Film, Menu, Tv2, X } from 'lucide-react';
import { useState, useEffect } from 'react';

import { cn } from '@/lib/utils';
import { useStore, useFilteredMedia } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { LogoIcon } from './icons';

const navLinks = [
  { href: '/', label: 'Live TV', icon: Tv2 },
  { href: '/movies', label: 'Movies', icon: Film },
  { href: '/series', label: 'Series', icon: Clapperboard },
];

export function Navbar() {
  const pathname = usePathname();
  const [isSheetOpen, setSheetOpen] = useState(false);
  const { totalCount } = useFilteredMedia();
  const setMediaType = useStore(state => state.setMediaType);

  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  const handleLinkClick = (href: string) => {
    if (href === '/') setMediaType('live');
    if (href === '/movies') setMediaType('movie');
    if (href === '/series') setMediaType('series');
    setSheetOpen(false);
  };

  const NavContent = () => (
    <>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "text-sm font-medium transition-colors flex items-center gap-2 px-3 py-2 rounded-md",
            pathname === link.href
              ? 'bg-zinc-800 text-white'
              : 'text-gray-400 hover:text-white'
          )}
          onClick={() => handleLinkClick(link.href)}
        >
          <link.icon className="h-4 w-4" />
          {link.label}
        </Link>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black flex-shrink-0">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg" onClick={() => handleLinkClick('/')}>
          <LogoIcon className="h-6 w-6 text-white" />
          <span className="font-headline">XtreamTV</span>
          {isClient && totalCount > 0 && <Badge variant="secondary" className="hidden md:flex">{totalCount.toLocaleString()}</Badge>}
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          <NavContent />
        </nav>

        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-black border-r-white/10 w-full max-w-xs p-0">
              <div className="p-4 flex justify-between items-center border-b border-white/10">
                <Link href="/" className="flex items-center gap-2 font-bold text-lg" onClick={() => handleLinkClick('/')}>
                  <LogoIcon className="h-6 w-6 text-white" />
                  <span className="font-headline">XtreamTV</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setSheetOpen(false)}>
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <nav className="flex flex-col gap-4 p-4">
                <NavContent />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
