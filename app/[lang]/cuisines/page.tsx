import { Locale, locales } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Home, Utensils } from 'lucide-react';
import { Metadata } from 'next';

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const metadata: Metadata = {
  title: 'Cuisines | BestCDMX',
  description: 'Explore different cuisines in Mexico City',
};

async function getCategories() {
  const { data: categories } = await supabase
    .from('categories')
    .select(`
      id,
      slug,
      name_en,
      name_es,
      description_en,
      description_es,
      restaurant_categories (
        restaurant_id
      )
    `)
    .order('name_en');

  return categories?.map(category => ({
    ...category,
    restaurantCount: category.restaurant_categories?.length || 0
  })) || [];
}

export default async function CuisinesPage({ params: { lang } }: { params: { lang: Locale } }) {
  const categories = await getCategories();

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
                {lang === 'en' ? 'Cuisines' : 'Cocinas'}
              </span>
            </li>
          </ol>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">
          {lang === 'en' ? 'Cuisines in Mexico City' : 'Cocinas en Ciudad de México'}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link key={category.slug} href={`/${lang}/cuisines/${category.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 group">
                <CardHeader>
                  <Utensils className="w-8 h-8 mb-2 text-primary" />
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {category[`name_${lang}` as const]}
                  </CardTitle>
                  <p className="text-muted-foreground mt-2">
                    {category.restaurantCount} {lang === 'en' ? 
                      `restaurant${category.restaurantCount === 1 ? '' : 's'}` : 
                      `restaurante${category.restaurantCount === 1 ? '' : 's'}`}
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