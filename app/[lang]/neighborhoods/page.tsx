import { Locale, locales } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Home, MapPin } from 'lucide-react';
import { Metadata } from 'next';

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params: { lang } }: { params: { lang: Locale } }): Promise<Metadata> {
  return {
    title: lang === 'en' ? 'Neighborhoods | BestCDMX' : 'Colonias | BestCDMX',
    description: lang === 'en' 
      ? 'Explore restaurants by neighborhood in Mexico City. Find the best places to eat in each area.'
      : 'Explora restaurantes por colonia en la Ciudad de México. Encuentra los mejores lugares para comer en cada zona.',
    alternates: {
      languages: {
        en: '/en/neighborhoods',
        es: '/es/neighborhoods',
      },
    },
  };
}

async function getNeighborhoods() {
  const { data: neighborhoods } = await supabase
    .from('neighborhoods')
    .select(`*,
      id,
      slug,
      name,
      description_en,
      description_es,
      restaurants (
        id,
        status
      )
    `)
    .order('name')
    .throwOnError();

  // Filter to only include neighborhoods that have published restaurants
  const activeNeighborhoods = neighborhoods?.filter(neighborhood => 
    neighborhood.restaurants?.some(restaurant => restaurant.status === 'published')
  );

  return activeNeighborhoods?.map(neighborhood => ({
    ...neighborhood,
    restaurantCount: neighborhood.restaurants?.filter(r => r.status === 'published').length || 0
  })) || [];
}

export default async function NeighborhoodsPage({ params: { lang } }: { params: { lang: Locale } }) {
  const neighborhoods = await getNeighborhoods();

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
                {lang === 'en' ? 'Neighborhoods' : 'Colonias'}
              </span>
            </li>
          </ol>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">
          {lang === 'en' ? 'Mexico City Neighborhoods' : 'Colonias de la Ciudad de México'}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {neighborhoods.map((neighborhood) => (
            <Link key={neighborhood.slug} href={`/${lang}/neighborhoods/${neighborhood.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 group">
                <CardHeader>
                  <MapPin className="w-8 h-8 mb-2 text-primary" />
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {neighborhood.name}
                  </CardTitle>
                  <p className="text-muted-foreground mt-2">
                    {neighborhood.restaurantCount} {lang === 'en' ? 
                      `restaurant${neighborhood.restaurantCount === 1 ? '' : 's'}` : 
                      `restaurante${neighborhood.restaurantCount === 1 ? '' : 's'}`}
                  </p>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}