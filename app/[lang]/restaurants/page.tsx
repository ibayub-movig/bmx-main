import { Locale, locales } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { RestaurantsList } from './components/restaurants-list';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

type Props = {
  params: {
    lang: string
  }
}

// Metadata generation
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = params
  const baseUrl = 'https://www.bestcdmx.com'
  const currentPath = `/${lang}/restaurants`
  
  return {
    title: lang === 'en' ? 'Best Restaurants in Mexico City' : 'Mejores Restaurantes en CDMX',
    description: lang === 'en' 
      ? 'Discover the best restaurants in Mexico City, from fine dining to local gems'
      : 'Descubre los mejores restaurantes en CDMX, desde alta cocina hasta joyas locales',
    alternates: {
      canonical: `${baseUrl}${currentPath}`,
      languages: {
        'en': `${baseUrl}/en/restaurants`,
        'es': `${baseUrl}/es/restaurants`
      }
    }
  }
}

// Static params generation
export function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'es' }]
}

async function getRestaurants() {
  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select(`
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
      ),
      neighborhoods!inner (
        id,
        name,
        slug
      )
    `)
    .eq('status', 'published')
    .order('name');

  if (error) {
    console.error('Error fetching restaurants:', error);
    return [];
  }

  return restaurants.map(restaurant => ({
    ...restaurant,
    categories: restaurant.restaurant_categories
      ?.filter(rc => rc.categories) // Filter out any null categories
      .map(rc => ({
        id: rc.categories.id,
        name_en: rc.categories.name_en,
        name_es: rc.categories.name_es
      })) || [],
    neighborhood: restaurant.neighborhoods
  }));
}

async function getCategories() {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('name_en');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return categories;
}

async function getActiveNeighborhoods() {
  const { data } = await supabase
    .from('restaurants')
    .select(`
      neighborhoods!inner (
        id,
        name,
        slug
      )
    `)
    .eq('status', 'published')

  // Create a Map using neighborhood id as the key to ensure uniqueness
  const neighborhoodMap = new Map(
    data?.map(r => [
      r.neighborhoods.id, 
      {
        id: r.neighborhoods.id,
        name: r.neighborhoods.name,
        slug: r.neighborhoods.slug
      }
    ])
  )

  // Convert Map values to array
  return Array.from(neighborhoodMap.values())
}
export default async function RestaurantsPage({ params: { lang } }: { params: { lang: Locale } }) {
  // Fetch all initial data server-side
  const [restaurants, categories, neighborhoods] = await Promise.all([
    getRestaurants(),
    getCategories(),
    getActiveNeighborhoods()
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
              <span className="font-medium">
                {lang === 'en' ? 'Restaurants' : 'Restaurantes'}
              </span>
            </li>
          </ol>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">
          {lang === 'en' ? 'Restaurants in Mexico City' : 'Restaurantes en Ciudad de México'}
        </h1>
        
        <RestaurantsList
          initialRestaurants={restaurants}
          initialCategories={categories}
          initialNeighborhoods={neighborhoods.sort((a, b) => a.name.localeCompare(b.name))}
          lang={lang}
        />
      </div>
    </div>
  );
}