"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, BookOpen, Utensils, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { SubscribeButton } from '@/app/[lang]/components/subscribe-button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Locale, dictionary } from '@/lib/i18n';

type Props = {
  lang: Locale;
  dictionary: {
    'nav.restaurants': string;
    'nav.guides': string;
    'nav.submit': string;
  };
};

export function NavigationMenu({ lang, dictionary: t }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const otherLang = lang === 'en' ? 'es' : 'en';

  const handleLanguageSwitch = () => {
    const newPath = pathname.replace(`/${lang}`, `/${otherLang}`);
    router.push(newPath);
  };

  return (
    <header className="border-b">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={`/${lang}`} className="hover:opacity-90 transition-opacity">
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href={`/${lang}/guides`} className="text-muted-foreground hover:text-foreground flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            {t['nav.guides']}
          </Link>
          <Link href={`/${lang}/restaurants`} className="text-muted-foreground hover:text-foreground flex items-center gap-2">
            <Utensils className="w-4 h-4" />
            {t['nav.restaurants']}
          </Link>
          
          <span className="text-muted-foreground/25">|</span>
          
          <div className="flex items-center gap-4">
            <Button asChild variant="secondary">
              <Link href={`/${lang}/submit`} className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                {t['nav.submit']}
              </Link>
            </Button>
            <SubscribeButton lang={lang} variant="primary" />
          </div>

          <div className="flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => lang !== 'en' && handleLanguageSwitch()}
              className={`px-2 py-1 rounded transition-colors ${
                lang === 'en' 
                  ? 'text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              EN
            </button>
            <span className="text-muted-foreground">/</span>
            <button
              onClick={() => lang !== 'es' && handleLanguageSwitch()}
              className={`px-2 py-1 rounded transition-colors ${
                lang === 'es'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              ES
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <div className="flex flex-col space-y-4 mt-8">
              <Link href={`/${lang}/guides`} className="text-lg flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
               {t['nav.guides']}
              </Link>
              <Link href={`/${lang}/restaurants`} className="text-lg flex items-center gap-2">
                <Utensils className="w-4 h-4" />
               {t['nav.restaurants']}
              </Link>
              <Link href={`/${lang}/submit`} className="text-lg flex items-center gap-2">
                <Send className="w-4 h-4" />
               {t['nav.submit']}
              </Link>
              <div className="flex items-center gap-1 text-sm font-medium">
                <button
                  onClick={() => lang !== 'en' && handleLanguageSwitch()}
                  className={`px-2 py-1 rounded transition-colors ${
                    lang === 'en'
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  EN
                </button>
                <span className="text-muted-foreground">/</span>
                <button
                  onClick={() => lang !== 'es' && handleLanguageSwitch()}
                  className={`px-2 py-1 rounded transition-colors ${
                    lang === 'es'
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  ES
                </button>
              </div>
              <SubscribeButton lang={lang} />
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}