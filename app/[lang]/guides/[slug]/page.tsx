import { Locale, locales } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home, BookOpen } from 'lucide-react';
import type { Metadata } from 'next';
import Markdown from 'react-markdown';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Utensils } from 'lucide-react';
import { SubscribeButton } from '../../components/subscribe-button';

type GuideItem = {
  guide_id: string;
  item_type: string;
  item_id: string;
  rank: number | null;  // Changed this to match what comes from database
  highlight_en: string | null;
  highlight_es: string | null;
  restaurants?: {
    id: string;
    slug: string;
    name: string;
    image_url: string;
    description_en: string;
    description_es: string;
    local_tips: string | null;
    price_range: string;
    rating: number | null;
    neighborhoods: {
      id: string;
      name: string;
      slug: string;
    };
  };
}
type Guide = {
  id: string;
  slug: string;
  name_en: string;
  name_es: string;
  content_en: string | null;
  content_es: string | null;
  meta_title_en: string | null;
  meta_title_es: string | null;
  meta_description_en: string | null;
  meta_description_es: string | null;
  cover_image_path: string | null;
  created_at: string;
  updated_at: string;
  items: GuideItem[];
}
export async function generateStaticParams() {
  const { data: guides } = await supabase
    .from('guides')
    .select('slug');

  if (!guides) return [];
  
  return locales.flatMap((lang) =>
    guides.map((guide) => ({
      lang,
      slug: guide.slug,
    }))
  );
}

async function getGuide(slug: string): Promise<Guide | null> {
  const { data: guide } = await supabase
    .from('guides')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (!guide) return null;

  const { data: items } = await supabase
    .from('guide_items')
    .select('*')
    .eq('guide_id', guide.id)
    .eq('item_type', 'restaurant')
    .order('rank');

  if (!items?.length) {
    return {
      ...guide,
      items: []
    };
  }

  const { data: restaurants } = await supabase
    .from('restaurants')
    .select(`
      id,
      slug,
      name,
      image_url,
      description_en,
      description_es,
      local_tips,
      price_range,
      rating,
      neighborhoods (
        id,
        name,
        slug
      )
    `)
    .in('id', items.map(item => item.item_id));

  const itemsWithRestaurants: GuideItem[] = items.map(item => ({
    guide_id: item.guide_id,
    item_type: item.item_type,
    item_id: item.item_id,
    rank: item.rank,  // No need to handle null since we updated the type
    highlight_en: item.highlight_en,
    highlight_es: item.highlight_es,
    restaurants: restaurants?.find(r => r.id === item.item_id)
  }));

  return {
    ...guide,
    items: itemsWithRestaurants
  };
}
type Props = {
  params: {
    lang: Locale;
    slug: string;
  };
};

export async function generateMetadata({ params: { lang, slug } }: Props): Promise<Metadata> {
  const guide = await getGuide(slug);
  
  if (!guide) {
    return {
      title: '404 - Not Found'
    };
  }
  
  return {
    title: guide[`meta_title_${lang}` as const] || guide[`name_${lang}` as const],
    description: guide[`meta_description_${lang}` as const],
    alternates: {
      languages: {
        en: `/en/guides/${slug}`,
        es: `/es/guides/${slug}`,
      },
    },
  };
}

export default async function GuidePage({ params: { lang, slug } }: Props) {
  const guide = await getGuide(slug);
  
  if (!guide) {
    notFound();
  }

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
              <Link 
                href={`/${lang}/guides`} 
                className="text-muted-foreground hover:text-foreground"
              >
                {lang === 'en' ? 'Guides' : 'Guías'}
              </Link>
            </li>
            <li>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </li>
            <li>
              <span className="font-medium">
                {guide[`name_${lang}` as const]}
              </span>
            </li>
          </ol>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Cover Image */}
        {guide.cover_image_path && (
          <div className="relative w-full h-[400px] rounded-lg overflow-hidden mb-8">
            <img
              src={guide.cover_image_path}
              alt={guide[`name_${lang}` as const]}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <h1 className="text-4xl font-bold mb-4">
          {guide[`name_${lang}` as const]}
        </h1>
        
        {/* Date Added */}
        <p className="text-sm text-muted-foreground mb-6">
          {lang === 'en' ? 'Date Added: ' : 'Fecha de Publicación: '}
          {new Date(guide.updated_at).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>

        {guide[`content_${lang}` as const] && (
          <div className="prose dark:prose-invert max-w-none mb-12">
            <Markdown>
              {guide[`content_${lang}` as const]}
            </Markdown>
          </div>
        )}
        
        {/* Table of Contents */}
        <div className="mb-12 bg-muted/50 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">
            {lang === 'en' ? 'In this guide' : 'En esta guía'}
          </h2>
          <nav>
            <ol className="space-y-2">
              {guide.items.map((item, index) => {
                if (item.item_type === 'restaurant' && item.restaurants) {
                  return (
                    <li key={item.item_id}>
                      <a 
                        href={`#${item.restaurants.slug}`}
                        className="text-muted-foreground hover:text-foreground flex items-center group"
                      >
                        <span className="mr-2 text-primary">{index + 1}.</span>
                        <span className="group-hover:underline">{item.restaurants.name}</span>
                      </a>
                    </li>
                  );
                }
                return null;
              })}
            </ol>
          </nav>
        </div>
      
        <div className="space-y-12">
          {guide.items.map((item) => {
            if (item.item_type === 'restaurant' && item.restaurants) {
              const restaurant = item.restaurants;
              return (
                <article key={item.item_id} id={restaurant.slug} className="group scroll-mt-24">
                  <div className="mb-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="aspect-[4/3] overflow-hidden rounded-lg">
                        <img 
                          src={restaurant.image_url} 
                          alt={restaurant.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h2 className="text-2xl font-bold mb-2">
                          <Link 
                            href={`/${lang}/restaurants/${restaurant.slug}`}
                            className="hover:text-primary transition-colors"
                          >
                            {restaurant.name}
                          </Link>
                        </h2>
                        <div className="flex items-center gap-2 mb-4">
                          <Badge variant="outline">
                            {restaurant.price_range}
                          </Badge>
                          <Badge variant="secondary">
                            {restaurant.neighborhoods.name}
                          </Badge>
                        </div>
  {item[`highlight_${lang}` as const] && (
    <p className="text-lg mb-4">
      {item[`highlight_${lang}` as const]}
    </p>
  )}
  <p className="text-lg mb-4">
    {restaurant[`description_${lang}` as const]}
  </p>
                        <Link 
                          href={`/${lang}/restaurants/${restaurant.slug}`}
                          className="text-primary hover:underline font-medium inline-flex items-center"
                        >
                          {lang === 'en' ? 'View restaurant details' : 'Ver detalles del restaurante'} →
                        </Link>
                      </div>
                    </div>
                  </div>                  
                  {/* Local Tips */}
                  {restaurant.local_tips && (
                    <div className="mt-6 bg-primary/5 border border-primary/10 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">
                        {lang === 'en' ? 'Local Tips' : 'Tips Locales'}
                      </h3>
                      <ul className="space-y-3">
                        {restaurant.local_tips.split('\n').filter(Boolean).map((tip, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-2 flex-shrink-0" />
                            <span className="text-muted-foreground">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              );
            }
            return null;
          })}
        </div>

        {/* Navigation CTAs */}
        <div className="mt-16 grid sm:grid-cols-2 gap-6">
          <Link href={`/${lang}/guides`}>
            <Card className="h-full hover:shadow-lg transition-shadow duration-300 group">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {lang === 'en' ? 'Explore Other Guides' : 'Explorar Otras Guías'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {lang === 'en' 
                        ? 'Discover more curated collections' 
                        : 'Descubre más colecciones curadas'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </Link>

          <Link href={`/${lang}/restaurants`}>
            <Card className="h-full hover:shadow-lg transition-shadow duration-300 group">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Utensils className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {lang === 'en' ? 'Browse All Restaurants' : 'Ver Todos los Restaurantes'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {lang === 'en'
                        ? 'Find your next favorite spot'
                        : 'Encuentra tu próximo lugar favorito'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Subscribe Banner */}
        <div className="mt-16 rounded-lg bg-primary p-8 text-primary-foreground">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">
              {lang === 'en'
                ? 'Find your next favorite place'
                : 'Encuentra tu próximo lugar favorito'}
            </h2>
            <div className="flex justify-center pt-2">
              <SubscribeButton lang={lang} variant="hero" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}