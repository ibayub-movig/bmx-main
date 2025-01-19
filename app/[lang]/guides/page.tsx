import { Locale, locales } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronRight, Home, BookOpen } from 'lucide-react';
import { Metadata } from 'next';
import Image from 'next/image';

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params: { lang } }: { params: { lang: Locale } }): Promise<Metadata> {
  const baseUrl = 'https://www.bestcdmx.com';
  const path = '/guides';
  const currentUrl = `${baseUrl}/${lang}${path}`;

  const title = lang === 'en' ? 'Guides | BestCDMX' : 'Guías | BestCDMX';
  const description = lang === 'en' 
    ? 'Explore curated guides to the best restaurants in Mexico City. Find local favorites and hidden gems.'
    : 'Explora guías curadas de los mejores restaurantes en la Ciudad de México. Encuentra favoritos locales y joyas ocultas.';

  return {
    title,
    description,
    alternates: {
      canonical: currentUrl,
      languages: {
        en: `${baseUrl}/en${path}`,
        es: `${baseUrl}/es${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url: currentUrl,
      siteName: 'BestCDMX',
      locale: lang === 'en' ? 'en_US' : 'es_MX',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  };
}

async function getGuides() {
  const { data: guides } = await supabase
    .from('guides')
    .select('*')
    .order('created_at', { ascending: false });

  if (!guides) return [];

  // Get item counts for each guide
  const guidesWithCounts = await Promise.all(
    guides.map(async (guide) => {
      const { count } = await supabase
        .from('guide_items')
        .select('*', { count: 'exact', head: true })
        .eq('guide_id', guide.id);

      return {
        ...guide,
        itemCount: count || 0
      };
    })
  );

  return guidesWithCounts;
}

export default async function GuidesPage({ params: { lang } }: { params: { lang: Locale } }) {
  const guides = await getGuides();

  return (
    <div>
      {/* Breadcrumbs */}
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
              <span className="font-medium">
                {lang === 'en' ? 'Guides' : 'Guías'}
              </span>
            </li>
          </ol>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">
          {lang === 'en' ? 'Restaurant Guides' : 'Guías de Restaurantes'}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide) => (
            <Link key={guide.slug} href={`/${lang}/guides/${guide.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 group">
                <CardHeader className="p-0">
                  {guide.cover_image_path ? (
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={guide.cover_image_path}
                        alt={guide[`name_${lang}` as const]}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-primary" />
                    </div>
                  )}
                  <div className="p-6">
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {guide[`name_${lang}` as const]}
                  </CardTitle>
                  <CardDescription>
                    {guide.itemCount} {lang === 'en' ? 
                      `place${guide.itemCount === 1 ? '' : 's'}` : 
                      `lugar${guide.itemCount === 1 ? '' : 'es'}`}
                  </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}