import { Locale } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import { locales } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, Phone, Globe, DollarSign, Award, Calendar, Utensils } from 'lucide-react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { generateRestaurantSchema } from '@/lib/schemas';


export async function generateStaticParams() {
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('slug')
    .eq('status', 'published');

  if (!restaurants) return [];
  
  return locales.flatMap((lang) =>
    restaurants.map((restaurant) => ({
      lang,
      slug: restaurant.slug,
    }))
  );
}

async function getRestaurant(slug: string) {
  const { data: restaurant, error } = await supabase
    .from('restaurants')
    .select(`
      *,
      restaurant_types_junction (
        type_id,
        restaurant_types (
          id,
          name_en,
          name_es
        )
      ),
      restaurant_categories (
        category_id,
        categories!inner (
          id,
          name_en,
          name_es
        )
      ),
      neighborhoods!inner (
        id,
        name,
        slug
      )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    console.error('Error fetching restaurant:', error);
    return null;
  }

  return {
    ...restaurant,
    restaurant_types_junction: restaurant.restaurant_types_junction?.map(junction => ({
      type_id: junction.type_id,
      restaurant_types: junction.restaurant_types
    })) || [],
    categories: restaurant.restaurant_categories
      ?.filter(rc => rc.categories)
      .map(rc => ({
        id: rc.categories.id,
        name_en: rc.categories.name_en,
        name_es: rc.categories.name_es
      })) || [],
    neighborhood: restaurant.neighborhoods
  };
}

type Props = {
  params: {
    lang: Locale;
    slug: string;
  };
};

export async function generateMetadata({ params: { lang, slug } }: Props): Promise<Metadata> {
  const restaurant = await getRestaurant(slug);
  
  if (!restaurant) {
    return {
      title: '404 - Not Found'
    };
  }
  
  const title = `${restaurant.name} - ${restaurant.neighborhood.name}, Mexico City`;
  const description = restaurant[`description_${lang}` as const] ?? undefined;
  const url = `https://bestcdmx.com/${lang}/restaurants/${slug}`;
  const imageUrl = restaurant.image_url;

  return {
    title,
    description,
    metadataBase: new URL('https://bestcdmx.com'),
    openGraph: {
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
      type: 'article',
      locale: lang,
      url,
      siteName: 'BestCDMX',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
    alternates: {
      canonical: url,
      languages: {
        en: `/en/restaurants/${slug}`,
        es: `/es/restaurants/${slug}`,
      },
    },
    other: {
      'application/ld+json': JSON.stringify(generateRestaurantSchema(restaurant, lang))
    }
  };
}

function formatHours(hoursString: string) {
  // Split the hours string into lines
  const lines = hoursString.split('\n').filter(Boolean);
  
  // Create an object to store the hours for each day
  const hoursMap = new Map();
  
  lines.forEach(line => {
    const [day, hours] = line.split(': ');
    hoursMap.set(day, hours);
  });
  
  return hoursMap;
}

function RatingBadge({ score, label, color = "bg-yellow-400 text-yellow-900" }: { score: number; label: string; color?: string }) {
  return (
    <Badge className={`${color} text-sm px-2 py-1`}>
      <Star className="w-4 h-4 mr-1" />
      <span className="font-medium">{score}</span>
      <span className="ml-1 text-xs opacity-75">{label}</span>
    </Badge>
  );
}

export default async function RestaurantPage({ params: { lang, slug } }: Props) {
  const restaurant = await getRestaurant(slug);
  
  if (!restaurant) {
    notFound();
  }

  return (
    <>
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
                  href={`/${lang}/restaurants`} 
                  className="text-muted-foreground hover:text-foreground"
                >
                  {lang === 'en' ? 'Restaurants' : 'Restaurantes'}
                </Link>
              </li>
              <li>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </li>
              <li>
                <span className="font-medium">
                  {restaurant.name}
                </span>
              </li>
            </ol>
          </nav>
        </div>

        <article className="min-h-screen">
          {/* Hero Section */}
          <div className="relative h-[50vh] min-h-[400px] w-full">
            <img
              src={restaurant.image_url}
              alt={restaurant.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="container mx-auto">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
                    <div className="flex items-center gap-4 text-sm mb-4">
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {restaurant.neighborhood.name}
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {restaurant.price_range}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {restaurant.categories?.map(category => (
                        <Badge key={category.id} variant="secondary">
                          {category[`name_${lang}` as const]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {restaurant.rating && (
                      <RatingBadge score={restaurant.rating} label="Rating" />
                    )}
                    {restaurant.custom_score && (
                      <RatingBadge 
                        score={restaurant.custom_score} 
                        label="BestCDMX Score"
                        color="bg-[#e57373] text-white"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 py-8 space-y-12">
            <nav className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b z-50 py-4">
              <div className="flex gap-4 overflow-x-auto">
                <a href="#about" className="text-muted-foreground hover:text-foreground">
                  {lang === 'en' ? 'About' : 'Acerca de'}
                </a>
                <a href="#ratings" className="text-muted-foreground hover:text-foreground">
                  {lang === 'en' ? 'Ratings & Reviews' : 'Calificaciones y Reseñas'}
                </a>
                <a href="#hours" className="text-muted-foreground hover:text-foreground">
                  {lang === 'en' ? 'Hours' : 'Horario'}
                </a>
                <a href="#location" className="text-muted-foreground hover:text-foreground">
                  {lang === 'en' ? 'Location' : 'Ubicación'}
                </a>
                <a href="#contact" className="text-muted-foreground hover:text-foreground">
                  {lang === 'en' ? 'Contact' : 'Contacto'}
                </a>
              </div>
            </nav>

            <section id="about" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6">
                {lang === 'en' ? 'About' : 'Acerca de'}
              </h2>
              <div className="space-y-8">
                {/* Restaurant Types */}
                <div className="flex flex-wrap gap-2">
                  {restaurant.restaurant_types_junction?.map((junction) => (
                    <Badge 
                      key={junction.type_id} 
                      variant="outline"
                      className="text-sm px-3 py-1"
                    >
                      {junction.restaurant_types[`name_${lang}`]}
                    </Badge>
                  ))}
                </div>

                {/* Description */}
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <p className="text-xl text-muted-foreground">
                    {restaurant[`description_${lang}` as const]}
                  </p>
                </div>

                {/* Meals & Atmosphere */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">
                      {lang === 'en' ? 'Meals Served' : 'Servicio de Comidas'}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {restaurant.meals_served?.map((meal) => (
                        <Badge key={meal} variant="secondary">
                          {meal.charAt(0).toUpperCase() + meal.slice(1).toLowerCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">
                      {lang === 'en' ? 'Atmosphere' : 'Ambiente'}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {restaurant.atmosphere?.map((type) => (
                        <Badge key={type} variant="secondary">
                          {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Signature Dishes */}
                {restaurant.signature_dishes && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      {lang === 'en' ? 'Signature Dishes' : 'Platillos Destacados'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.values(restaurant.signature_dishes).map((dish, index) => (
                        <div key={index} className="bg-card rounded-lg border p-4">
                          <h4 className="font-medium mb-2">{dish}</h4>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Local Tips */}
                {restaurant.local_tips && (
                  <div className="bg-primary/5 border border-primary/10 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      <span className="flex items-center">
                        <Award className="w-5 h-5 mr-2 text-primary" />
                      {lang === 'en' ? 'Local Tips' : 'Tips Locales'}
                      </span>
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
              </div>
            </section>

            <section id="ratings" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6">
                {lang === 'en' ? 'Ratings & Reviews' : 'Calificaciones y Reseñas'}
              </h2>
              <div className="space-y-8">
                {/* Overall Score */}
                <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-6xl font-bold text-primary mb-2">{restaurant.custom_score}</div>
                    <p className="text-muted-foreground flex-1">{restaurant.score_summary}</p>
                  </div>

                  {/* Individual Scores */}
                  <div className="flex flex-wrap gap-3">
                    {restaurant.food_score && (
                      <Badge variant="outline" className="text-sm py-1 px-3">
                        <span className="font-medium mr-2">{restaurant.food_score}</span>
                        <span className="text-muted-foreground">{lang === 'en' ? 'Food' : 'Comida'}</span>
                      </Badge>
                    )}
                    {restaurant.service_score && (
                      <Badge variant="outline" className="text-sm py-1 px-3">
                        <span className="font-medium mr-2">{restaurant.service_score}</span>
                        <span className="text-muted-foreground">{lang === 'en' ? 'Service' : 'Servicio'}</span>
                      </Badge>
                    )}
                    {restaurant.ambience_score && (
                      <Badge variant="outline" className="text-sm py-1 px-3">
                        <span className="font-medium mr-2">{restaurant.ambience_score}</span>
                        <span className="text-muted-foreground">{lang === 'en' ? 'Atmosphere' : 'Ambiente'}</span>
                      </Badge>
                    )}
                    {restaurant.value_score && (
                      <Badge variant="outline" className="text-sm py-1 px-3">
                        <span className="font-medium mr-2">{restaurant.value_score}</span>
                        <span className="text-muted-foreground">{lang === 'en' ? 'Value' : 'Valor'}</span>
                      </Badge>
                    )}
                    {restaurant.accessibility_score && (
                      <Badge variant="outline" className="text-sm py-1 px-3">
                        <span className="font-medium mr-2">{restaurant.accessibility_score}</span>
                        <span className="text-muted-foreground">{lang === 'en' ? 'Accessibility' : 'Accesibilidad'}</span>
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    {lang === 'en' 
                      ? "Scoring based on weighted 10-point system for Mexico City restaurants, combining expert reviews, general feedback, and more"
                      : "Puntuación basada en un sistema ponderado de 10 puntos para restaurantes de la Ciudad de México, combinando reseñas de expertos, comentarios generales y más"
                    }
                  </p>
                </div>

                {/* Google Reviews */}
                {(restaurant.rating || restaurant.review_count) && (
                  <div className="bg-card rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <svg viewBox="0 0 24 24" className="w-6 h-6">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{restaurant.rating}</span>
                            <Star className="w-4 h-4 fill-current text-yellow-400" />
                          </div>
                        </div>
                        <div className="text-muted-foreground">
                          {restaurant.review_count?.toLocaleString()} {lang === 'en' ? 'reviews' : 'reseñas'}
                        </div>
                      </div>
                    </div>
                    {restaurant.last_updated && (
                      <div className="text-sm text-muted-foreground">
                        {lang === 'en' ? 'Last Updated: ' : 'Última Actualización: '}
                        {new Date(restaurant.last_updated).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            <section id="hours" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6">
                {lang === 'en' ? 'Hours' : 'Horario'}
              </h2>
              <div className="space-y-8">
                {restaurant.smart_visit && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-primary" />
                      {lang === 'en' ? 'Smart Visit' : 'Visita Inteligente'}
                    </h3>
                    <p className="text-muted-foreground">
                      {restaurant.smart_visit}
                    </p>
                  </div>
                )}

                {(restaurant.peak_hours || restaurant.quiet_hours) && (
                  <div className="grid gap-6 md:grid-cols-2">
                    {restaurant.peak_hours && (
                      <div className="bg-muted/50 rounded-lg p-4">
                        <h4 className="text-md font-semibold mb-2 flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-destructive" />
                          {lang === 'en' ? 'Peak Hours' : 'Horas Pico'}
                        </h4>
                        <p className="text-muted-foreground">
                          {restaurant.peak_hours}
                        </p>
                      </div>
                    )}
                    {restaurant.quiet_hours && (
                      <div className="bg-muted/50 rounded-lg p-4">
                        <h4 className="text-md font-semibold mb-2 flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-primary" />
                          {lang === 'en' ? 'Quiet Hours' : 'Horas Tranquilas'}
                        </h4>
                        <p className="text-muted-foreground">
                          {restaurant.quiet_hours}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    {lang === 'en' ? 'Opening Hours' : 'Horario'}
                  </h3>
                  {restaurant.opening_hours && typeof restaurant.opening_hours === 'string' && (
                    <div className="grid gap-2 bg-card rounded-lg border p-4">
                      {Array.from(formatHours(restaurant.opening_hours)).map(([day, hours], index) => {
                        const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day;
                        return (
                          <div 
                            key={day} 
                            className={`flex justify-between items-center py-2 border-b last:border-0 ${isToday ? 'bg-muted/50 px-2 rounded' : ''}`}
                          >
                            <span className="font-medium">
                              {isToday && (
                                <Badge variant="default" className="mr-2 bg-primary text-primary-foreground">
                                  {lang === 'en' ? 'Today' : 'Hoy'}
                                </Badge>
                              )}
                              {day}
                            </span>
                            <span className={`font-medium ${hours === 'Closed' ? 'text-destructive' : ''}`}>
                              {hours}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section id="location" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6">
                {lang === 'en' ? 'Location' : 'Ubicación'}
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {lang === 'en' ? 'Address' : 'Dirección'}
                  </h3>
                  <p className="text-muted-foreground">{restaurant.address}</p>
                </div>
                {restaurant.latitude && restaurant.longitude && (
                  <Link
                    href={`https://www.google.com/maps?q=${encodeURIComponent(restaurant.name)}&query_place_id=${restaurant.place_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block aspect-[16/9] w-full rounded-lg overflow-hidden border hover:opacity-95 transition-opacity"
                  >
                    <img 
                      src={`https://api.mapbox.com/styles/v1/mapbox/light-v11/static/pin-l+f43f5e(${restaurant.longitude},${restaurant.latitude})/${restaurant.longitude},${restaurant.latitude},14,0/800x450@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`}
                      alt={`Map showing location of ${restaurant.name}`}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                )}
              </div>
            </section>

            <section id="contact" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6">
                {lang === 'en' ? 'Contact' : 'Contacto'}
              </h2>
              <div className="overflow-hidden rounded-lg border bg-card">
                <table className="w-full">
                  <tbody className="divide-y">
                    {restaurant.website_url && (
                      <tr className="hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium">
                          {lang === 'en' ? 'Website' : 'Sitio Web'}
                        </td>
                        <td className="px-4 py-3">
                          <a 
                            href={restaurant.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center"
                          >
                            <Globe className="w-4 h-4 mr-2" />
                            {new URL(restaurant.website_url).hostname}
                          </a>
                        </td>
                      </tr>
                    )}
                    {restaurant.place_id && (
                      <tr className="hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium">
                          {lang === 'en' ? 'Directions' : 'Cómo Llegar'}
                        </td>
                        <td className="px-4 py-3">
                          <a 
                            href={`https://www.google.com/maps?q=place_id:${restaurant.place_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center"
                          >
                            <MapPin className="w-4 h-4 mr-2" />
                            Google Maps
                          </a>
                        </td>
                      </tr>
                    )}
                    {restaurant.phone_number && (
                      <tr className="hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium">
                          {lang === 'en' ? 'Phone' : 'Teléfono'}
                        </td>
                        <td className="px-4 py-3">
                          <a 
                            href={`tel:${restaurant.phone_number}`}
                            className="text-primary hover:underline flex items-center"
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            {restaurant.phone_number}
                          </a>
                        </td>
                      </tr>
                    )}
                    {restaurant.instagram_url && (
                      <tr className="hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium">Instagram</td>
                        <td className="px-4 py-3">
                          <a 
                            href={restaurant.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center"
                          >
                            <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2">
                              <path
                                fill="currentColor"
                                d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                              />
                            </svg>
                            @{new URL(restaurant.instagram_url).pathname.replace('/', '')}
                          </a>
                        </td>
                      </tr>
                    )}
                    {restaurant.menu_url && (
                      <tr className="hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium">
                          {lang === 'en' ? 'Menu' : 'Menú'}
                        </td>
                        <td className="px-4 py-3">
                          <a 
                            href={restaurant.menu_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center"
                          >
                            <Utensils className="w-4 h-4 mr-2" />
                            {lang === 'en' ? 'View Menu' : 'Ver Menú'}
                          </a>
                        </td>
                      </tr>
                    )}
                    {restaurant.reservation_url && (
                      <tr className="hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium">
                          {lang === 'en' ? 'Reservations' : 'Reservaciones'}
                        </td>
                        <td className="px-4 py-3">
                          <a 
                            href={restaurant.reservation_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center"
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            {lang === 'en' ? 'Make a Reservation' : 'Hacer una Reservación'}
                          </a>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </article>
      </div>
    </>
  );
}
