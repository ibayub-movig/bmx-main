// lib/schemas.tsx
import type { Database } from './database.types';
import { type Locale } from '@/lib/i18n';

type RestaurantWithRelations = Database['public']['Tables']['restaurants']['Row'] & {
  restaurant_types_junction: {
    type_id: string;
    restaurant_types: {
      id: string;
      name_en: string | null;
      name_es: string | null;
    };
  }[];
  categories: {
    id: string;
    name_en: string;
    name_es: string;
  }[];
  neighborhood: {
    id: string;
    name: string;
    slug: string;
  };
};

export const generateRestaurantSchema = (restaurant: RestaurantWithRelations, lang: Locale) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: restaurant.name,
    description: restaurant[`description_${lang}` as const],
    url: `https://www.bestcdmx.com/${lang}/restaurants/${restaurant.slug}`,
    image: restaurant.image_url,
    address: {
      '@type': 'PostalAddress',
      streetAddress: restaurant.address ?? undefined,
      addressLocality: 'Mexico City',
      postalCode: restaurant.postal_code ?? undefined,
      addressRegion: 'CDMX',
      addressCountry: 'MX',
    },
    telephone: restaurant.phone_number ?? undefined,
    priceRange: restaurant.price_range,
    
    ...(restaurant.categories?.length > 0 && {
      servesCuisine: restaurant.categories.map(cat => 
        cat[`name_${lang}` as 'name_en' | 'name_es']
      )
    }),
    
    ...(restaurant.review_count && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: restaurant.rating,
        reviewCount: restaurant.review_count,
        bestRating: 5,
        worstRating: 1
      }
    }),
    
    ...(restaurant.latitude && restaurant.longitude && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: restaurant.latitude,
        longitude: restaurant.longitude
      }
    })
  };

  return schema;
};