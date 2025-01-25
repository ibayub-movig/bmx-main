import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from './lib/i18n';
 
function getLocale(request: NextRequest) {
  // Check URL for locale
  const pathname = request.nextUrl.pathname;
  const pathnameLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  if (pathnameLocale) return pathnameLocale;

  // Check Accept-Language header
  const acceptedLanguage = request.headers.get('accept-language')?.split(',')[0].split('-')[0];
  if (acceptedLanguage && locales.includes(acceptedLanguage as any)) {
    return acceptedLanguage;
  }

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip if the request is for an asset or API route
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }
  
  // If the pathname starts with a locale, let it pass through
  if (locales.some(locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`)) {
    return NextResponse.next();
  }
  
  // Redirect to the appropriate locale
  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

// Add at the end of middleware.ts
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}