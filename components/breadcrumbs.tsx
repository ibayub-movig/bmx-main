// components/breadcrumbs.tsx
'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

type BreadcrumbItem = {
  href?: string;
  label: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <div className="border-b">
      <nav className="container mx-auto px-4 py-3">
        <ol className="flex items-center space-x-2 text-sm">
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />}
              {item.href ? (
                <Link 
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground flex items-center"
                >
                  {index === 0 ? <Home className="h-4 w-4" /> : item.label}
                </Link>
              ) : (
                <span className="font-medium">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}