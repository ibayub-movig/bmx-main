'use client';
// app/[lang]/neighborhoods/[slug]/components/restaurants-list-wrapper.tsx
import { Locale } from '@/lib/i18n';
import { RestaurantsList } from '../../../restaurants/components/restaurants-list';

export function RestaurantsListWrapper({ 
  initialRestaurants, 
  initialCategories, 
  initialNeighborhoods, 
  lang, 
  neighborhoodId 
}: { 
  initialRestaurants: any[];
  initialCategories: any[];
  initialNeighborhoods: any[];
  lang: Locale;
  neighborhoodId: string;
}) {
  return (
    <RestaurantsList
      initialRestaurants={initialRestaurants}
      initialCategories={initialCategories}
      initialNeighborhoods={initialNeighborhoods}
      lang={lang}
      lockedFilters={{
        neighborhoods: [neighborhoodId]
      }}
    />
  );
}
