// app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import Script from 'next/script'
import {Analytics} from '@vercel/analytics/next'

const inter = Inter({ subsets: ['latin'] })

const GA_ID = process.env.NEXT_PUBLIC_GA_ID
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID
const BASE_URL = 'https://www.bestcdmx.com'

if (!GA_ID) {
  console.warn('Google Analytics ID is not defined in environment variables')
}

if (!GTM_ID) {
  console.warn('Google Tag Manager ID is not defined in environment variables')
}

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    template: '%s | BestCDMX',
    default: 'BestCDMX - Discover the Best of Mexico City',
  },
  description: 'Your ultimate guide to restaurants, attractions, and experiences in Mexico City',
  icons: {
    icon: '/favicon.ico',
  },
  // SEO optimizations
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Language alternates
  alternates: {
    canonical: BASE_URL,
    languages: {
      'en': `${BASE_URL}/en`,
      'es': `${BASE_URL}/es`,
    },
  },
  // Open Graph
  openGraph: {
    title: 'BestCDMX - Discover the Best of Mexico City',
    description: 'Your ultimate guide to restaurants, attractions, and experiences in Mexico City',
    url: BASE_URL,
    siteName: 'BestCDMX',
    locale: 'es_MX',
    type: 'website',
    alternateLocale: ['en_US'],
  },
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'BestCDMX',
    description: 'Your ultimate guide to restaurants, attractions, and experiences in Mexico City',
  },
  // Verification
  verification: {
    google: 'your-google-site-verification', // Add your verification code
  },
  // Other metadata
  category: 'travel',
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: true,
  },
}

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { lang: string }
}) {
  const lang = params?.lang || 'es'

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        {/* Schema.org markup for Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "BestCDMX",
              "url": BASE_URL,
              "potentialAction": {
                "@type": "SearchAction",
                "target": `${BASE_URL}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        {GTM_ID && (
          <Script id="gtm" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `}
          </Script>
        )}
      </head>
      <body className={inter.className}>
        {GTM_ID && (
          <noscript>
            <iframe 
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0" 
              width="0" 
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        {children}
        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
        <Analytics/>
      </body>
    </html>
  )
}