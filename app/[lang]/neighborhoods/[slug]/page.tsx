import { Locale, locales } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { Metadata } from 'next';
import { RestaurantsList } from '../../restaurants/components/restaurants-list';

export async function generateStaticParams() {
  const { data: neighborhoods } = await supabase
    .from('neighborhoods')
    .select('slug');

  if (!neighborhoods) return [];
  
  return locales.flatMap((lang) =>
    neighborhoods.map((neighborhood) => ({
      lang,
      slug: neighborhood.slug,
    }))
  );
}

async function getNeighborhood(slug: string) {
  const { data: neighborhood } = await supabase
    .from('neighborhoods')
    .select(`
      *,
      restaurants (
        id,
        slug,
        name,
        latitude,
        longitude,
        image_url,
        description_en,
        description_es,
        price_range,
        neighborhood_id,
        rating,
        custom_score,
        tagline,
        restaurant_categories (
          category_id,
          categories!inner (
            id,
            name_en,
            name_es
          )
        )
      )
    `)
    .eq('slug', slug)
    .single();

  if (!neighborhood) return null;

  // Transform the data structure to match the restaurants page format
  const restaurants = neighborhood.restaurants?.map(restaurant => ({
    ...restaurant,
    categories: restaurant.restaurant_categories
      ?.map(rc => ({
        id: rc.categories.id,
        name_en: rc.categories.name_en,
        name_es: rc.categories.name_es
      })) || [],
    neighborhood: {
      id: neighborhood.id,
      name: neighborhood.name,
      slug: neighborhood.slug
    }
  })) || [];

  return {
    ...neighborhood,
    restaurants
  };
}

type Props = {
  params: {
    lang: Locale;
    slug: string;
  };
};

export async function generateMetadata({ params: { lang, slug } }: Props): Promise<Metadata> {
  const neighborhood = await getNeighborhood(slug);
  
  if (!neighborhood) {
    return {
      title: '404 - Not Found'
    };
  }
  
  return {
    title: neighborhood[`meta_title_${lang}` as const] || neighborhood.name,
    description: neighborhood[`meta_description_${lang}` as const] || neighborhood[`description_${lang}` as const],
    alternates: {
      languages: {
        en: `/en/neighborhoods/${slug}`,
        es: `/es/neighborhoods/${slug}`,
      },
    },
  };
}

export default async function NeighborhoodPage({ params: { lang, slug } }: Props) {
  const neighborhood = await getNeighborhood(slug);
  
  if (!neighborhood) {
    notFound();
  }

  // Get all categories and neighborhoods for the filters
  const [{ data: categories }, { data: neighborhoods }] = await Promise.all([
    supabase.from('categories').select('*').order('name_en'),
    supabase.from('neighborhoods').select('*').order('name')
  ]);

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
              <span className="font-medium">
                {neighborhood.name}
              </span>
            </li>
          </ol>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">
          {neighborhood.name}
        </h1>
        
        {neighborhood[`description_${lang}` as const] && (
          <p className="text-lg text-muted-foreground mb-8">
            {neighborhood[`description_${lang}` as const]}
          </p>
        )}
        
        <p className="mb-8">
          <Link 
            href={`/${lang}/restaurants`}
            className="text-primary hover:underline"
          >
            {lang === 'en' ? 'Browse all restaurants' : 'Ver todos los restaurantes'} →
          </Link>
        </p>
        
        <RestaurantsList
          initialRestaurants={neighborhood.restaurants}
          initialCategories={categories || []}
          initialNeighborhoods={neighborhoods || []}
          lang={lang}
          lockedFilters={{
            neighborhoods: [neighborhood.id]
          }}
        />
      </div>
    </div>
  );
}