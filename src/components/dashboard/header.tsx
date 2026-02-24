'use client';
import { UserNav } from './user-nav';
import { ThemeToggle } from '../theme-toggle';
import { SidebarTrigger } from '../ui/sidebar';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-4 items-center">
          <SidebarTrigger />
          <a href="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold text-primary">Global Opportunity Tracker</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <ThemeToggle />
            <UserNav />
          </nav>
        </div>
      </div>
    </header>
  );
}
