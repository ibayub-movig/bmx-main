// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from './lib/i18n';

function getLocale(request: NextRequest) {
 const pathname = request.nextUrl.pathname;
 console.log('Getting locale for pathname:', pathname);
 
 const pathnameLocale = locales.find(
   (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
 );
 
 if (pathnameLocale) {
   console.log('Found pathname locale:', pathnameLocale);
   return pathnameLocale;
 }

 const acceptedLanguage = request.headers.get('accept-language')?.split(',')[0].split('-')[0];
 if (acceptedLanguage && locales.includes(acceptedLanguage as any)) {
   console.log('Using accepted language:', acceptedLanguage);
   return acceptedLanguage;
 }

 console.log('Using default locale:', defaultLocale);
 return defaultLocale;
}

export function middleware(request: NextRequest) {
 const pathname = request.nextUrl.pathname;
 console.log('Middleware pathname:', pathname);
 
 if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
   return NextResponse.next();
 }

 const locale = getLocale(request);

 if (!pathname.startsWith(`/${locale}`)) {
   const newPath = `/${locale}${pathname === '/' ? '' : pathname}`;
   request.nextUrl.pathname = newPath;
   return NextResponse.redirect(request.nextUrl);
 }

 return NextResponse.next();
}

export const config = {
 matcher: [
   '/((?!api|_next/static|_next/image|favicon.ico).*)',
 ],
}