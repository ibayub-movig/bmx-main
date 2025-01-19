// lib/schemas.ts
import type { Database } from './database.types';

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

type LangField = 'en' | 'es';

export const generateRestaurantSchema = (restaurant: RestaurantWithRelations, lang: LangField) => {
  const url = `https://bestcdmx.com/${lang}/restaurants/${restaurant.slug}`;
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': url,
    name: restaurant.name,
    url,
    image: restaurant.image_url,
    description: restaurant[`description_${lang}` as const],
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
    
    // Add categories if they exist
    ...(restaurant.categories?.length > 0 ? {
      servesCuisine: restaurant.categories.map(cat => 
        cat[`name_${lang}` as 'name_en' | 'name_es']
      )
    } : {}),
    
    ...(restaurant.review_count ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: restaurant.rating,
        ratingCount: restaurant.review_count,
        bestRating: 5,
        worstRating: 1
      }
    } : {}),
    
    ...(restaurant.latitude && restaurant.longitude ? {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: restaurant.latitude,
        longitude: restaurant.longitude
      }
    } : {})
  };

  // Remove any null/undefined values
  return JSON.parse(JSON.stringify(jsonLd));
};