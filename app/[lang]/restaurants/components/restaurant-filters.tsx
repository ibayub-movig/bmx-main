"use client"

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import { Locale } from '@/lib/i18n';

type Props = {
  lang: Locale;
  categories: Array<{ id: string; name_en: string; name_es: string }>;
  neighborhoods: Array<{ id: string; name: string }>;
  onFiltersChange: React.Dispatch<React.SetStateAction<Filters>>;
  lockedFilters?: {
    categories?: string[];
    neighborhoods?: string[];
  };
};

export type Filters = {
  search: string;
  categories: string[];
  neighborhoods: string[];
  priceRange: string[];
};

export function RestaurantFilters({ lang, categories, neighborhoods, onFiltersChange, lockedFilters }: Props) {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    categories: lockedFilters?.categories || [],
    neighborhoods: lockedFilters?.neighborhoods || [],
    priceRange: [],
  });

  // Keep local filters in sync with parent state
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      ...onFiltersChange,
    }));
  }, [onFiltersChange]);

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(prev => ({ ...prev, ...newFilters }));
  };

  const removeCategory = (categoryId: string) => {
    if (lockedFilters?.categories?.includes(categoryId)) return;
    handleFilterChange({
      categories: filters.categories.filter(id => id !== categoryId)
    });
  };

  const removeNeighborhood = (neighborhoodId: string) => {
    if (lockedFilters?.neighborhoods?.includes(neighborhoodId)) return;
    handleFilterChange({
      neighborhoods: filters.neighborhoods.filter(id => id !== neighborhoodId)
    });
  };

  const removePriceRange = (price: string) => {
    handleFilterChange({
      priceRange: filters.priceRange.filter(p => p !== price)
    });
  };

  const getActiveCategoryNames = () => {
    return filters.categories.map(id => {
      const category = categories.find(c => c.id === id);
      return category ? category[`name_${lang}` as const] : '';
    });
  };

  const getActiveNeighborhoodNames = () => {
    return filters.neighborhoods.map(id => {
      const neighborhood = neighborhoods.find(n => n.id === id);
      return neighborhood ? neighborhood.name : '';
    });
  };
  return (
    <div className="bg-background p-6 rounded-lg border">
      {/* Active Filters */}
      {((filters.categories?.length || 0) > 0 || 
        (filters.neighborhoods?.length || 0) > 0 || 
        (filters.priceRange?.length || 0) > 0) && (
        <div className="mb-6">
          <Label className="mb-2 block">
            {lang === 'en' ? 'Active Filters' : 'Filtros Activos'}
          </Label>
          <div className="flex flex-wrap gap-2">
            {getActiveCategoryNames().map((name, index) => (
              <Badge
                key={`cat-${index}`}
                variant="secondary"
                className={`flex items-center gap-1 ${
                  lockedFilters?.categories?.includes(filters.categories[index]) ? 'opacity-75' : ''
                }`}
              >
                {name}
                {!lockedFilters?.categories?.includes(filters.categories[index]) && (
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeCategory(filters.categories[index])}
                  />
                )}
              </Badge>
            ))}
            {getActiveNeighborhoodNames().map((name, index) => (
              <Badge
                key={`neigh-${index}`}
                variant="secondary"
                className={`flex items-center gap-1 ${
                  lockedFilters?.neighborhoods?.includes(filters.neighborhoods[index]) ? 'opacity-75' : ''
                }`}
              >
                {name}
                {!lockedFilters?.neighborhoods?.includes(filters.neighborhoods[index]) && (
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeNeighborhood(filters.neighborhoods[index])}
                  />
                )}
              </Badge>
            ))}
            {filters.priceRange.map((price) => (
              <Badge
                key={`price-${price}`}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {price}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removePriceRange(price)}
                />
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6 max-h-[calc(100vh-220px)] overflow-y-auto pr-2">
        {/* Search */}
        <div>
          <Label>{lang === 'en' ? 'Search' : 'Buscar'}</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={lang === 'en' ? 'Search restaurants...' : 'Buscar restaurantes...'}
              className="pl-8"
              value={filters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
            />
          </div>
        </div>

        {/* Price Range */}
        <div>
          <Label className="mb-4 block">
            {lang === 'en' ? 'Price Range' : 'Rango de Precio'}
          </Label>
          <div className="flex flex-wrap gap-2">
            {['$', '$$', '$$$', '$$$$'].map((price) => (
              <Badge
                key={price}
                variant={filters.priceRange.includes(price) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  const newPriceRange = filters.priceRange.includes(price)
                    ? filters.priceRange.filter(p => p !== price)
                    : [...filters.priceRange, price];
                  handleFilterChange({ priceRange: newPriceRange });
                }}
              >
                {price}
              </Badge>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <Label className="mb-4 block">
            {lang === 'en' ? 'Categories' : 'Categorías'}
          </Label>
          <div className="space-y-2">
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant={filters.categories.includes(category.id) ? "default" : "outline"}
                className={`mr-2 mb-2 ${
                  lockedFilters?.categories?.includes(category.id) ? 'opacity-75' : 'cursor-pointer'
                }`}
                onClick={() => {
                  if (lockedFilters?.categories?.includes(category.id)) return;
                  const newCategories = filters.categories.includes(category.id)
                    ? filters.categories.filter(id => id !== category.id)
                    : [...filters.categories, category.id];
                  handleFilterChange({ categories: newCategories });
                }}
              >
                  {lang === 'en' ? category.name_en : category.name_es}
              </Badge>
            ))}
          </div>
        </div>

        {/* Neighborhoods */}
        <div>
          <Label className="mb-4 block">
            {lang === 'en' ? 'Neighborhood' : 'Colonia'}
          </Label>
          <div className="space-y-2">
            {neighborhoods.map((neighborhood) => (
              <Badge
                key={neighborhood.id}
                variant={filters.neighborhoods.includes(neighborhood.id) ? "default" : "outline"}
                className={`mr-2 mb-2 ${
                  lockedFilters?.neighborhoods?.includes(neighborhood.id) ? 'opacity-75' : 'cursor-pointer'
                }`}
                onClick={() => {
                  if (lockedFilters?.neighborhoods?.includes(neighborhood.id)) return;
                  const newNeighborhoods = filters.neighborhoods.includes(neighborhood.id)
                    ? filters.neighborhoods.filter(id => id !== neighborhood.id)
                    : [...filters.neighborhoods, neighborhood.id];
                  handleFilterChange({ neighborhoods: newNeighborhoods });
                }}
              >
                {neighborhood.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}