// app/[lang]/cuisines/[slug]/page.tsx
import { Metadata } from 'next';
import { Locale } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { CuisineContent } from '@/app/[lang]/cuisines/[slug]/cuisine-content';

export const revalidate = 3600;

type Props = {
  params: {
    lang: Locale;
    slug: string;
  };
};

async function getCategory(slug: string) {
  const { data: category } = await supabase
    .from('categories')
    .select(`
      id,
      slug,
      name_en,
      name_es,
      description_en,
      description_es,
      meta_title_en,
      meta_title_es,
      meta_description_en,
      meta_description_es,
      restaurant_categories!inner (
        restaurants!inner (
          id,
          slug,
          name,
          latitude,
          longitude,
          image_url,
          description_en,
          description_es,
          price_range,
          neighborhood_id,
          rating,
          custom_score,
          tagline,
          neighborhood:neighborhoods!inner (
            id,
            name,
            slug
          )
        )
      )
    `)
    .eq('slug', slug)
    .single();

  return category;
}

export async function generateStaticParams() {
  const { data: categories } = await supabase
    .from('categories')
    .select('slug');

  return (categories || []).flatMap((category) => [
    { lang: 'en', slug: category.slug },
    { lang: 'es', slug: category.slug }
  ]);
}

export async function generateMetadata({ params: { lang, slug } }: Props): Promise<Metadata> {
  const category = await getCategory(slug);
  
  if (!category) {
    return { title: '404 - Not Found' };
  }
  
  const baseUrl = 'https://www.bestcdmx.com';
  
  return {
    title: category[`meta_title_${lang}`] || `${category[`name_${lang}`]} Restaurants in Mexico City | BestCDMX`,
    description: category[`meta_description_${lang}`] || category[`description_${lang}`] || undefined,
    alternates: {
      canonical: `${baseUrl}/${lang}/cuisines/${slug}`,
      languages: {
        en: `${baseUrl}/en/cuisines/${slug}`,
        es: `${baseUrl}/es/cuisines/${slug}`
      }
    }
  };
}

export default async function CuisinePage({ params: { lang, slug } }: Props) {
  const category = await getCategory(slug);
  
  if (!category) {
    notFound();
  }

  const [{ data: categories }, { data: neighborhoods }] = await Promise.all([
    supabase.from('categories').select('*'),
    supabase.from('neighborhoods').select('*')
  ]);

  return (
    <CuisineContent 
      category={category}
      categories={categories || []}
      neighborhoods={neighborhoods || []}
      lang={lang}
    />
  );
}