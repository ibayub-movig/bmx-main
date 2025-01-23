import { Locale, locales } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { Metadata } from 'next';
import { RestaurantsList } from '../../restaurants/components/restaurants-list';

type Props = {
  params: {
    lang: Locale;
    slug: string;
  };
};

export const revalidate = 3600; // Revalidate every hour

export async function generateStaticParams() {
  const { data: categories } = await supabase
    .from('categories')
    .select('slug');

  if (!categories) return [];
  
  return locales.flatMap((lang) =>
    categories.map((category) => ({
      lang,
      slug: category.slug,
    }))
  );
}

async function getCategory(slug: string) {
  const { data: category } = await supabase
    .from('categories')
    .select(`
        id,
        slug,
        name_en,
        name_es,
        description_en,
        description_es,
      meta_title_en,
      meta_title_es,
      meta_description_en,
      meta_description_es,
      restaurant_categories!inner (
        restaurants!inner (
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
          neighborhood:neighborhoods!inner (
            id,
            name,
            slug
          )
        )
      )
    `)
    .eq('slug', slug)
    .single();

  if (!category) return null;

  // Sort restaurants by rating/custom_score for better initial presentation
  const restaurants = (category.restaurant_categories?.map(rc => ({
    ...rc.restaurants,
    categories: [{
      id: category.id,
      name_en: category.name_en,
      name_es: category.name_es
    }],
    neighborhood: rc.restaurants.neighborhood
  })) || []).sort((a, b) => {
    const scoreA = a.custom_score || a.rating || 0;
    const scoreB = b.custom_score || b.rating || 0;
    return scoreB - scoreA;
  });

  return {
    ...category,
    restaurants
  };
}

export async function generateMetadata({ params: { lang, slug } }: Props): Promise<Metadata> {
  const category = await getCategory(slug);
  
  if (!category) {
    return {
      title: '404 - Not Found'
    };
  }
  
  const baseUrl = 'https://www.bestcdmx.com';
  const currentUrl = `${baseUrl}/${lang}/cuisines/${slug}`;
  
  const title = category[`meta_title_${lang}` as const] || 
    `${category[`name_${lang}` as const]} Restaurants in Mexico City | BestCDMX`;
  
  const description = category[`meta_description_${lang}` as const] || 
    category[`description_${lang}` as const] || 
    `Find the best ${category[`name_${lang}` as const]} restaurants in Mexico City. Explore menus, reviews, and recommendations.`;

  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    openGraph: {
      title,
      description,
      type: 'article',
      locale: lang,
      url: currentUrl,
      siteName: 'BestCDMX',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: currentUrl,
      languages: {
        en: `/en/cuisines/${slug}`,
        es: `/es/cuisines/${slug}`,
      },
    }
  };
}

export default async function CuisinePage({ params: { lang, slug } }: Props) {
  const category = await getCategory(slug);
  
  if (!category) {
    notFound();
  }

  const [{ data: categories }, { data: neighborhoods }] = await Promise.all([
    supabase.from('categories').select('*').order('name_en'),
    supabase.from('neighborhoods').select('*').order('name')
  ]);

  const translations = {
    en: {
      browseAll: 'Browse all restaurants',
      seeAll: 'See all restaurants',
      cuisines: 'Cuisines',
    },
    es: {
      browseAll: 'Ver todos los restaurantes',
      seeAll: 'Ver todos los restaurantes',
      cuisines: 'Cocinas',
    }
  };

  return (
    <div>
      <div className="border-b">
        <nav className="container mx-auto px-4 py-3" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href={`/${lang}`} className="text-muted-foreground hover:text-foreground flex items-center">
                <Home className="h-4 w-4" />
                <span className="sr-only">Home</span>
              </Link>
            </li>
            <li>
              <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </li>
            <li>
              <Link 
                href={`/${lang}/cuisines`} 
                className="text-muted-foreground hover:text-foreground"
              >
                {translations[lang].cuisines}
              </Link>
            </li>
            <li>
              <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </li>
            <li>
              <span className="font-medium">
                {category[`name_${lang}` as const]}
              </span>
            </li>
          </ol>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">
          {category[`name_${lang}` as const]}
        </h1>
        
        {category[`description_${lang}` as const] && (
          <p className="text-lg text-muted-foreground mb-8">
            {category[`description_${lang}` as const]}
          </p>
        )}
        
        <p className="mb-8">
          <Link 
            href={`/${lang}/restaurants`}
            className="text-primary hover:underline"
          >
            {translations[lang].browseAll} →
          </Link>
        </p>
        
        <RestaurantsList
          initialRestaurants={category.restaurants}
          initialCategories={categories || []}
          initialNeighborhoods={neighborhoods || []}
          lang={lang}
          lockedFilters={{
            categories: [category.id]
          }}
        />
      </div>
    </div>
  );
}