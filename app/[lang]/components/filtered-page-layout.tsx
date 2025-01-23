// app/components/filtered-page-layout.tsx
import { Locale } from '@/lib/i18n';
import { RestaurantsList } from '@/app/[lang]/restaurants/components/restaurants-list';

type FilteredPageProps = {
  title: string;
  description?: string | null;  // Updated to allow null
  initialRestaurants: any[];
  initialCategories: any[];
  initialNeighborhoods: any[];
  lang: Locale;
  lockedFilters?: {
    categories?: string[];
    neighborhoods?: string[];
  };
  breadcrumbs: React.ReactNode;
};

export function FilteredPageLayout({
  title,
  description,
  initialRestaurants,
  initialCategories,
  initialNeighborhoods,
  lang,
  lockedFilters,
  breadcrumbs
}: FilteredPageProps) {
  return (
    <div>
      {breadcrumbs}
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        {description && (
          <p className="text-lg text-muted-foreground mb-8">
            {description}
          </p>
        )}
        
        <RestaurantsList
          initialRestaurants={initialRestaurants}
          initialCategories={initialCategories}
          initialNeighborhoods={initialNeighborhoods}
          lang={lang}
          lockedFilters={lockedFilters}
        />
      </div>
    </div>
  );
}