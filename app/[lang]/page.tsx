import { Locale, dictionary } from '@/lib/i18n';
import { MapPin, Utensils, BookOpen, Music, Palette, Search, Mail, ArrowRight, Building2, Award, CalendarClock } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { locales } from '@/lib/i18n';
import { SubscribeButton } from './components/subscribe-button';
import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import Image from 'next/image';
export const revalidate = 1800;

export async function generateMetadata({ 
  params: { lang } 
}: { 
  params: { lang: Locale } 
}): Promise<Metadata> {
  const baseUrl = 'https://www.bestcdmx.com';
  const currentUrl = lang === 'en' ? baseUrl : `${baseUrl}/${lang}`;

  return {
    title: lang === 'en' 
      ? 'BestCDMX - Discover the Best of Mexico City' 
      : 'BestCDMX - Descubre lo Mejor de la Ciudad de México',
    description: lang === 'en' 
      ? 'Your ultimate guide to the best restaurants, attractions, and experiences in Mexico City. Discover local favorites and hidden gems.'
      : 'Tu guía definitiva de los mejores restaurantes, atracciones y experiencias en la Ciudad de México. Descubre favoritos locales y joyas ocultas.',
    
    alternates: {
      canonical: currentUrl,
      languages: {
        en: `${baseUrl}`,
        es: `${baseUrl}/es`,
      },
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    openGraph: {
      title: lang === 'en' 
        ? 'BestCDMX - Discover the Best of Mexico City' 
        : 'BestCDMX - Descubre lo Mejor de la Ciudad de México',
      description: lang === 'en'
        ? 'Your ultimate guide to restaurants, attractions, and experiences in Mexico City'
        : 'Tu guía definitiva de restaurantes, atracciones y experiencias en la Ciudad de México',
      url: currentUrl,
      siteName: 'BestCDMX',
      locale: lang === 'en' ? 'en_US' : 'es_MX',
      type: 'website',
      alternateLocale: lang === 'en' ? ['es_MX'] : ['en_US'],
    },

    twitter: {
      card: 'summary_large_image',
      title: lang === 'en' 
        ? 'BestCDMX - Best of Mexico City' 
        : 'BestCDMX - Lo Mejor de CDMX',
      description: lang === 'en'
        ? 'Your ultimate guide to Mexico City'
        : 'Tu guía definitiva de la Ciudad de México',
    },
    category: 'travel',
    
    formatDetection: {
      telephone: true,
      date: true,
      address: true,
      email: true,
    },
  }
}

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

async function getFeaturedRestaurants() {
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select(`
      id,
      slug,
      name,
      tagline,
      image_url,
      price_range,
      custom_score,
      neighborhoods!inner (
        id,
        name,
        slug
      )
    `)
    .eq('status', 'published')
    .contains('tags', ['featured'])
    .order('custom_score', { ascending: false })
    .limit(3);

  return restaurants;
}

export default async function Home({ params: { lang } }: { params: { lang: Locale } }) {
  const t = dictionary[lang];
  if (!t) return null;
  const featuredRestaurants = await getFeaturedRestaurants();

  const popularNeighborhoods = [
    {
      name: 'Polanco',
      slug: 'polanco',
      description: lang === 'en' 
        ? 'Upscale dining and luxury shopping'
        : 'Restaurantes exclusivos y tiendas de lujo',
      image: {
        src: 'https://media.cntraveler.com/photos/5df7d20d70aab000096fdd11/master/w_320%2Cc_limit/Antara-Fashion-Hall_Leila-Ashtari_2019_AntaraFH_CNT_CDMX_DSF4974_FLAT.jpg',
        width: 800,
        height: 600,
        alt: 'Polanco neighborhood in Mexico City featuring luxury shopping and restaurants'
      }
    },
    {
      name: 'Condesa',
      slug: 'condesa',
      description: lang === 'en'
        ? 'Hip cafes and art deco architecture'
        : 'Cafés de moda y arquitectura art deco',
      image: {
        src: 'https://bridgesandballoons.com/Images/2016/04/Things_to_do_in_Condesa-6.jpg',
        width: 800,
        height: 600,
        alt: 'Condesa neighborhood in Mexico City with art deco buildings and cafes'
      }
    },
    {
      name: 'Roma Norte',
      slug: 'roma-norte',
      description: lang === 'en'
        ? 'Trendy restaurants and boutiques'
        : 'Restaurantes y boutiques de moda',
      image: {
        src: 'https://assets.vogue.com/photos/5aac1f567b28220bee117065/master/w_2560%2Cc_limit/00-story-image-roma-neighborhood-mexico-city-guide.jpg',
        width: 800,
        height: 600,
        alt: 'Roma Norte neighborhood in Mexico City featuring trendy streets and restaurants'
      }
    }
  ];

  return (
    <>
      <section className="relative h-[70vh] flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative text-center text-white space-y-6">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            {t['hero.title']}
          </h1>
          <p className="text-xl">
            {t['hero.subtitle']}
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button 
              size="lg" 
              variant="default"
              className="bg-white text-black hover:bg-white/90"
              asChild
            >
              <Link href={`/${lang}/restaurants`}>
                <Search className="w-4 h-4 mr-2" />
                {lang === 'en' ? 'Browse Restaurants' : 'Explorar Restaurantes'}
              </Link>
            </Button>
            <SubscribeButton lang={lang} variant="hero" />
          </div>
        </div>
      </section>

      {/* City Introduction */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            {lang === 'en' ? 'Welcome to Mexico City' : 'Bienvenidos a la Ciudad de México'}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            {lang === 'en' 
              ? 'A vibrant metropolis where ancient traditions meet modern innovation. From street food to fine dining, historic neighborhoods to contemporary art scenes, Mexico City offers an unforgettable experience for every visitor.'
              : 'Una metrópolis vibrante donde las tradiciones ancestrales se encuentran con la innovación moderna. Desde la comida callejera hasta la alta cocina, desde barrios históricos hasta escenas de arte contemporáneo, la Ciudad de México ofrece una experiencia inolvidable para cada visitante.'}
          </p>
        </div>
      </section>

      {/* Popular Neighborhoods */}
      <section className="bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">
              {lang === 'en' ? 'Popular Neighborhoods' : 'Colonias Populares'}
            </h2>
            <Link 
              href={`/${lang}/neighborhoods`}
              className="text-primary hover:text-primary/80 flex items-center gap-2"
            >
              {lang === 'en' ? 'View all neighborhoods' : 'Ver todas las colonias'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularNeighborhoods.map((neighborhood) => (
              <Link 
                key={neighborhood.slug} 
                href={`/${lang}/neighborhoods/${neighborhood.slug}`}
                className="group"
              >
                <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow duration-300">
                  <div className="aspect-[4/3] overflow-hidden">
                    <Image
                      src={neighborhood.image.src}
                      alt={neighborhood.image.alt}
                      width={neighborhood.image.width}
                      height={neighborhood.image.height}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      sizes="(min-width: 1280px) 384px, (min-width: 1024px) calc(33.33vw - 32px), (min-width: 768px) calc(50vw - 48px), calc(100vw - 32px)"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      {neighborhood.name}
                    </CardTitle>
                    <CardDescription>{neighborhood.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

{/* Editorial Guides */}
<section className="container mx-auto px-4 py-16">
 <div className="max-w-4xl mx-auto">
   <div className="text-center mb-12">
     <h2 className="text-3xl font-bold mb-4">
       {lang === 'en' ? 'CDMX Guides' : 'Guías de CDMX'}
     </h2>
     <p className="text-lg text-muted-foreground">
       {lang === 'en' 
         ? 'Curated guides to help you discover the best of Mexico City dining'
         : 'Guías seleccionadas para ayudarte a descubrir lo mejor de la gastronomía en CDMX'}
     </p>
   </div>

   <div className="grid grid-cols-1 gap-8">
     <Card className="group hover:shadow-lg transition-shadow">
       <Link href={`/${lang}/guides/top-restaurants`}>
         <div className="md:flex">
           <div className="md:w-1/2 aspect-[4/3] relative">
             <Image
               src="https://exqhoigbuistjbcrdpwy.supabase.co/storage/v1/object/public/guide-covers/toprestaurants.jpg" 
               alt="Top restaurants in Mexico City"
               fill
               className="object-cover"
             />
           </div>
           <div className="p-6 md:w-2/3">
             <CardTitle className="mb-2 group-hover:text-primary transition-colors">
               {lang === 'en' ? 'The Top Restaurants in Mexico City' : 'Los Mejores Restaurantes en CDMX'}
             </CardTitle>
             <CardDescription className="mb-4">
               {lang === 'en'
                 ? 'From world-renowned fine dining to hidden gems, discover must-try restaurants in Mexico City'
                 : 'Desde restaurantes de alta cocina de renombre mundial hasta joyas ocultas, descubre nuestra lista'}
             </CardDescription>
             <div className="flex items-center text-primary">
               <span className="mr-2">
                 {lang === 'en' ? 'Read the guide' : 'Leer la guía'}
               </span>
               <ArrowRight className="w-4 h-4" />
             </div>
           </div>
         </div>
       </Link>
     </Card>

     <div className="text-center">
       <Button variant="outline" asChild>
         <Link href={`/${lang}/guides`}>
           <BookOpen className="w-4 h-4 mr-2" />
           {lang === 'en' ? 'Browse All Guides' : 'Ver Todas las Guías'}
         </Link>
       </Button>
     </div>
   </div>
 </div>
</section>

      {/* Featured Restaurants */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">
            {lang === 'en' ? 'Featured Restaurants' : 'Restaurantes Destacados'}
          </h2>
          <Link 
            href={`/${lang}/restaurants`}
            className="text-primary hover:text-primary/80 flex items-center gap-2"
          >
            {lang === 'en' ? 'View all restaurants' : 'Ver todos los restaurantes'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredRestaurants?.map((restaurant) => (
            <Link 
              key={restaurant.slug} 
              href={`/${lang}/restaurants/${restaurant.slug}`}
              className="group"
            >
              <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow duration-300">
                <div className="aspect-[4/3] overflow-hidden relative">
                  <Image
                    src={restaurant.image_url || ''}
                    alt={restaurant.name || ''}
                    fill
                    sizes="(min-width: 1280px) 384px, (min-width: 1024px) calc(33.33vw - 32px), (min-width: 768px) calc(50vw - 48px), calc(100vw - 32px)"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    quality={85}
                  />
                  {restaurant.custom_score && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-[#e57373] text-white">
                        <Award className="w-3 h-3 mr-1" />
                        {restaurant.custom_score}
                      </Badge>
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {restaurant.name}
                  </CardTitle>
                  {restaurant.tagline && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {restaurant.tagline}
                    </p>
                  )}
                  <CardDescription className="flex items-center justify-between">
                    <span>{restaurant.neighborhoods?.name}</span>
                    <span>{restaurant.price_range}</span>
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Subscribe CTA */}
      <section className="bg-primary">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl font-bold text-primary-foreground">
              {lang === 'en' 
                ? 'Stay Updated with BestCDMX'
                : 'Mantente Actualizado con BestCDMX'}
            </h2>
            <p className="text-xl text-primary-foreground/80">
              {lang === 'en'
                ? 'Get the latest restaurant reviews, neighborhood guides, and local tips delivered to your inbox.'
                : 'Recibe las últimas reseñas de restaurantes, guías de colonias y consejos locales en tu correo.'}
            </p>
            <div className="flex justify-center pt-4">
              <SubscribeButton lang={lang} variant="hero" />
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          {lang === 'en' ? 'Coming Soon' : 'Próximamente'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <MapPin className="w-8 h-8 mb-2 text-primary" />
              <CardTitle>{t['categories.attractions']}</CardTitle>
              <CardDescription>
                {lang === 'en'
                  ? 'Must-visit places and sights'
                  : 'Lugares y sitios imprescindibles'}
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <Music className="w-8 h-8 mb-2 text-primary" />
              <CardTitle>{t['categories.nightlife']}</CardTitle>
              <CardDescription>
                {lang === 'en'
                  ? 'Best bars and nightclubs'
                  : 'Mejores bares y discotecas'}
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <Palette className="w-8 h-8 mb-2 text-primary" />
              <CardTitle>{t['categories.culture']}</CardTitle>
              <CardDescription>
                {lang === 'en'
                  ? 'Museums and cultural sites'
                  : 'Museos y sitios culturales'}
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <CalendarClock className="w-8 h-8 mb-2 text-primary" />
              <CardTitle>
                {lang === 'en' ? 'Itinerary Planner' : 'Planificador de Itinerarios'}
              </CardTitle>
              <CardDescription>
                {lang === 'en'
                  ? 'Plan your perfect Mexico City trip'
                  : 'Planifica tu viaje perfecto a la Ciudad de México'}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </>
  );
}