// app/sitemap.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function sitemap() {
  const baseUrl = 'https://bestcdmx.com' // Replace with your domain

  // Fetch data from your tables
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('slug, updated_at')
    .eq('status', 'published')

  const { data: neighborhoods } = await supabase
    .from('neighborhoods')
    .select('slug, updated_at')

  const { data: categories } = await supabase
    .from('categories')
    .select('slug, updated_at')

  const { data: restaurantTypes } = await supabase
    .from('restaurant_types')
    .select('slug, updated_at')

  // Generate sitemap entries
  const entries = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1
    },
    // Restaurant pages
    ...(restaurants?.map(restaurant => ({
      url: `${baseUrl}/restaurant/${restaurant.slug}`,
      lastModified: new Date(restaurant.updated_at),
      changeFrequency: 'weekly',
      priority: 0.8
    })) || []),
    // English restaurant pages
    ...(restaurants?.map(restaurant => ({
      url: `${baseUrl}/en/restaurant/${restaurant.slug}`,
      lastModified: new Date(restaurant.updated_at),
      changeFrequency: 'weekly',
      priority: 0.8
    })) || []),
    // Neighborhood pages
    ...(neighborhoods?.map(neighborhood => ({
      url: `${baseUrl}/neighborhood/${neighborhood.slug}`,
      lastModified: new Date(neighborhood.updated_at),
      changeFrequency: 'weekly',
      priority: 0.7
    })) || []),
    // Category pages
    ...(categories?.map(category => ({
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: new Date(category.updated_at),
      changeFrequency: 'weekly',
      priority: 0.7
    })) || []),
    // Restaurant type pages
    ...(restaurantTypes?.map(type => ({
      url: `${baseUrl}/type/${type.slug}`,
      lastModified: new Date(type.updated_at),
      changeFrequency: 'weekly',
      priority: 0.7
    })) || [])
  ]

  // Store in sitemap_urls table for tracking
  const { error } = await supabase
    .from('sitemap_urls')
    .upsert(
      entries.map(entry => ({
        url: entry.url,
        last_modified: entry.lastModified,
        priority: entry.priority,
        change_frequency: entry.changeFrequency,
        language: entry.url.includes('/en/') ? 'en' : 'es',
        updated_at: new Date()
      })),
      { onConflict: 'url' }
    )

  if (error) {
    console.error('Error updating sitemap_urls:', error)
  }

  return entries
}