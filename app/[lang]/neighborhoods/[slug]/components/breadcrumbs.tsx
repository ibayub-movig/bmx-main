import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { Locale } from '@/lib/i18n';

export function Breadcrumbs({ 
  lang, 
  neighborhoodName 
}: { 
  lang: Locale;
  neighborhoodName: string;
}) {
  return (
    <div className="border-b">
      <nav className="container mx-auto px-4 py-3">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link href={`/${lang}`} className="text-muted-foreground hover:text-foreground flex items-center">
              <Home className="h-4 w-4" />
            </Link>
          </li>
          <li>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </li>
          <li>
            <Link 
              href={`/${lang}/neighborhoods`} 
              className="text-muted-foreground hover:text-foreground"
            >
              {lang === 'en' ? 'Neighborhoods' : 'Colonias'}
            </Link>
          </li>
          <li>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </li>
          <li>
            <span className="font-medium">{neighborhoodName}</span>
          </li>
        </ol>
      </nav>
    </div>
  );
}