// app/[lang]/cuisines/[slug]/cuisine-content.tsx
'use client';

import { Locale } from '@/lib/i18n';
import { RestaurantsList } from '../../restaurants/components/restaurants-list';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

type Props = {
  category: any;
  categories: any[];
  neighborhoods: any[];
  lang: Locale;
};

export function CuisineContent({ category, categories, neighborhoods, lang }: Props) {
  const restaurants = category.restaurant_categories?.map((rc: any) => ({
    ...rc.restaurants,
    categories: [{
      id: category.id,
      name_en: category.name_en,
      name_es: category.name_es
    }],
    neighborhood: rc.restaurants.neighborhood
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
          initialCategories={categories}
          initialNeighborhoods={neighborhoods}
          lang={lang}
          lockedFilters={{ categories: [category.id] }}
        />
      </div>
    </div>
  );
}