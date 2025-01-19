"use client"

import { useState, useEffect, useCallback, useRef } from 'react';
import { Locale } from '@/lib/i18n';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Utensils, DollarSign, Award } from 'lucide-react';
import Link from 'next/link';
import { RestaurantFilters, type Filters } from './restaurant-filters';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/use-debounce';

type Restaurant = {
  id: string;
  slug: string;
  latitude: number | null;
  longitude: number | null;
  name: string;
  meals_served?: string[] | null;
  image_url: string;
  description_en: string;
  description_es: string;
  price_range: string;
  neighborhood_id: string;
  rating: number | null;
  custom_score: number | null;
  tagline: string | null;
  categories: Array<{
    id: string;
    name_en: string;
    name_es: string;
  }>;
  neighborhood: {
    id: string;
    name: string;
    slug: string;
  };
};
function RestaurantCard({ restaurant, lang }: { restaurant: Restaurant; lang: Locale }) {
  return (
    <Link href={`/${lang}/restaurants/${restaurant.slug}`} className="block">
      <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
        <CardHeader className="p-0 relative overflow-hidden">
          <div className="overflow-hidden relative">
            <div className="aspect-[4/3]">
              <img 
                src={restaurant.image_url} 
                alt={restaurant.name} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <div className="absolute top-2 right-2 flex gap-2">
              {restaurant.rating && (
                <Badge className="bg-yellow-400 text-yellow-900">
                  <Star className="w-3 h-3 mr-1" />
                  {restaurant.rating}
                </Badge>
              )}
              {restaurant.custom_score && (
                <Badge className="bg-[#e57373] text-white">
                  <Award className="w-3 h-3 mr-1" />
                  {restaurant.custom_score}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-300">{restaurant.name}</h3>
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="mr-2">{restaurant.neighborhood.name}</span>
            {/* Removed the cuisine line that was causing the error */}
            <DollarSign className="w-4 h-4 mr-1 flex-shrink-0" />
            <span>{restaurant.price_range}</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Utensils className="w-4 h-4 mr-1 flex-shrink-0" />
            {restaurant.categories?.map(category => (
              <Badge key={category.id} variant="secondary" className="text-xs">
                {category[`name_${lang}` as const]}
              </Badge>
            ))}
          </div>
          {restaurant.tagline && (
            <p className="text-sm text-gray-700 line-clamp-2">{restaurant.tagline}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-[200px] w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}

type Props = {
  initialRestaurants: Restaurant[];
  initialCategories: any[];
  initialNeighborhoods: any[];
  lang: Locale;
  lockedFilters?: {
    categories?: string[];
    neighborhoods?: string[];
  };
};

export function RestaurantsList({ 
  initialRestaurants, 
  initialCategories, 
  initialNeighborhoods, 
  lang,
  lockedFilters 
}: Props) {
  // URL parameter handling
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse URL params into filters
  const parseUrlParams = useCallback(() => {
    // Start with locked filters if they exist
    const baseFilters = {
      categories: lockedFilters?.categories || [],
      neighborhoods: lockedFilters?.neighborhoods || [],
    };

    const q = searchParams.get('q') || '';
    const c = searchParams.get('c')?.split(',').filter(Boolean) || baseFilters.categories;
    const n = searchParams.get('n')?.split(',').filter(Boolean) || baseFilters.neighborhoods;
    const p = searchParams.get('p')?.split(',').filter(Boolean) || [];

    return {
      search: q,
      categories: c,
      neighborhoods: n,
      priceRange: p,
    };
  }, [searchParams, lockedFilters]);

  // Update URL with current filters
  const updateUrl = useCallback((newFilters: Filters) => {
    const params = new URLSearchParams();
    
    if (newFilters.search) params.set('q', newFilters.search);
    if (newFilters.categories.length && !lockedFilters?.categories?.length) {
      params.set('c', newFilters.categories.join(','));
    }
    if (newFilters.neighborhoods.length && !lockedFilters?.neighborhoods?.length) {
      params.set('n', newFilters.neighborhoods.join(','));
    }
    if (newFilters.priceRange.length) params.set('p', newFilters.priceRange.join(','));

    const newUrl = `?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  }, [router, lockedFilters]);

  const [restaurants] = useState<Restaurant[]>(initialRestaurants);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(initialRestaurants);
  const [filters, setFilters] = useState<Filters>(parseUrlParams());
  const [isFiltering, setIsFiltering] = useState(false);
  const filterTimeoutRef = useRef<NodeJS.Timeout>();
  const debouncedFilters = useDebounce(filters, 300);

  // Initialize filters from URL on mount
  useEffect(() => {
    setFilters(parseUrlParams());
  }, [parseUrlParams]);

  // Update URL when filters change
  useEffect(() => {
    updateUrl(debouncedFilters);
  }, [debouncedFilters, updateUrl]);

  // Apply filters whenever debounced filters change
  useEffect(() => {
    // If no filters are active, show all restaurants
    if (!debouncedFilters.search && 
        debouncedFilters.categories.length === 0 && 
        debouncedFilters.neighborhoods.length === 0 && 
        debouncedFilters.priceRange.length === 0) {
      setFilteredRestaurants(restaurants);
      return;
    }

    setIsFiltering(true);
    let filtered = restaurants;
    
    // Apply search filter
    if (debouncedFilters.search) {
      const searchTerm = debouncedFilters.search.toLowerCase();
      filtered = filtered.filter(restaurant => 
        restaurant.name.toLowerCase().includes(searchTerm) ||
        restaurant[`description_${lang}`].toLowerCase().includes(searchTerm)
      );
    }

    // Apply category filter
    if (debouncedFilters.categories.length > 0) {
      filtered = filtered.filter(restaurant =>
        debouncedFilters.categories.some(categoryId =>
          restaurant.categories.some(cat => cat.id === categoryId)
        )
      );
    }

    // Apply neighborhoods filter
    if (debouncedFilters.neighborhoods.length > 0) {
      filtered = filtered.filter(restaurant =>
        debouncedFilters.neighborhoods.includes(restaurant.neighborhood_id)
      );
    }

    // Apply price range filter (multi-select)
    if (debouncedFilters.priceRange.length > 0) {
      filtered = filtered.filter(restaurant =>
        debouncedFilters.priceRange.includes(restaurant.price_range)
      );
    }

    setFilteredRestaurants(filtered);
    setIsFiltering(false);

    // Cleanup timeout on unmount or filter change
    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
    };
  }, [debouncedFilters, restaurants, lang]);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Filters Sidebar */}
      <aside className="lg:w-80 flex-shrink-0">
        <div className="sticky top-24">
          <RestaurantFilters
            lang={lang}
            categories={initialCategories}
            neighborhoods={initialNeighborhoods}
            onFiltersChange={setFilters}
            lockedFilters={lockedFilters}
          />
        </div>
      </aside>

      {/* Restaurant Grid */}
      <div className="flex-1 max-w-5xl">
        {isFiltering ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <LoadingSkeleton key={n} />
            ))}
          </div>
        ) : (
          <>
            <p className="text-muted-foreground mb-4">
              {filteredRestaurants.length} {lang === 'en' ? 
                `restaurant${filteredRestaurants.length === 1 ? '' : 's'}` : 
                `restaurante${filteredRestaurants.length === 1 ? '' : 's'}`}
              {(debouncedFilters.search || 
                debouncedFilters.categories.length > 0 || 
                debouncedFilters.neighborhoods.length > 0 || 
                debouncedFilters.priceRange.length > 0) && 
                ` ${lang === 'en' ? 'found' : 'encontrados'}`}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.slug}
                  restaurant={restaurant}
                  lang={lang}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}