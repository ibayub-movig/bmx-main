// app/[lang]/cuisines/[slug]/page.tsx
import { Metadata } from 'next';
import { Locale } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { RestaurantsList } from '../../restaurants/components/restaurants-list';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

type Props = {
  params: {
    lang: Locale;
    slug: string;
  };
};

export const revalidate = 3600;

export async function generateStaticParams() {
  const { data: categories } = await supabase
    .from('categories')
    .select('slug');

  return (categories || []).flatMap((category) => [
    { lang: 'en', slug: category.slug },
    { lang: 'es', slug: category.slug }
  ]);
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
      restaurant_categories (
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
          neighborhoods (
            id,
            name,
            slug
          )
        )
      )
    `)
    .eq('slug', slug)
    .single();

  return category;
}

export async function generateMetadata({ params: { lang, slug } }: Props): Promise<Metadata> {
  const category = await getCategory(slug);
  
  if (!category) {
    return { title: '404 - Not Found' };
  }
  
  const baseUrl = 'https://www.bestcdmx.com';
  
  return {
    title: category[`meta_title_${lang}`] || `${category[`name_${lang}`]} Restaurants in Mexico City | BestCDMX`,
    description: category[`meta_description_${lang}`] || category[`description_${lang}`] || undefined,
    alternates: {
      canonical: `${baseUrl}/${lang}/cuisines/${slug}`,
      languages: {
        en: `${baseUrl}/en/cuisines/${slug}`,
        es: `${baseUrl}/es/cuisines/${slug}`
      }
    }
  };
}

export default async function CuisinePage({ params: { lang, slug } }: Props) {
  const category = await getCategory(slug);
  
  if (!category) {
    notFound();
  }

  const [{ data: categories }, { data: neighborhoods }] = await Promise.all([
    supabase.from('categories').select('*'),
    supabase.from('neighborhoods').select('*')
  ]);

  const restaurants = category.restaurant_categories?.map(rc => ({
    ...rc.restaurants,
    categories: [{
      id: category.id,
      name_en: category.name_en,
      name_es: category.name_es
    }],
    neighborhood: rc.restaurants.neighborhoods
  })) || [];

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
            <li><ChevronRight className="h-4 w-4 text-muted-foreground" /></li>
            <li>
              <Link href={`/${lang}/cuisines`} className="text-muted-foreground hover:text-foreground">
                {lang === 'en' ? 'Cuisines' : 'Cocinas'}
              </Link>
            </li>
            <li><ChevronRight className="h-4 w-4 text-muted-foreground" /></li>
            <li>
              <span className="font-medium">{category[`name_${lang}`]}</span>
            </li>
          </ol>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">
          {category[`name_${lang}`]}
        </h1>
        
        {category[`description_${lang}`] && (
          <p className="text-lg text-muted-foreground mb-8">
            {category[`description_${lang}`]}
          </p>
        )}

        <RestaurantsList
          initialRestaurants={restaurants}
          initialCategories={categories || []}
          initialNeighborhoods={neighborhoods || []}
          lang={lang}
          lockedFilters={{ categories: [category.id] }}
        />
      </div>
    </div>
  );
}