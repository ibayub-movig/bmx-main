// lib/sitemap-manager.ts
import { createClient } from '@supabase/supabase-js'

interface DatabaseItem {
  slug: string
  updated_at: string
}

interface SitemapUrl {
  url: string
  language: 'en' | 'es'
  last_modified: Date
  priority: number
  change_frequency: 'daily' | 'weekly' | 'monthly'
  updated_at: Date
}

type ContentType = 'restaurant' | 'neighborhood' | 'category' | 'guide'

type PathConfig = {
  [K in ContentType]: {
    en: string
    es: string
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const baseUrl = 'https://www.bestcdmx.com'

export async function updateSitemapUrls() {
  try {
    // 1. Fetch all current data
    const [
      { data: restaurants },
      { data: neighborhoods },
      { data: categories },
      { data: guides }
    ] = await Promise.all([
      supabase
        .from('restaurants')
        .select('slug, updated_at')
        .eq('status', 'published'),
      supabase
        .from('neighborhoods')
        .select('slug, updated_at'),
      supabase
        .from('categories')
        .select('slug, updated_at'),
      supabase
        .from('guides')
        .select('slug, updated_at')
        .eq('status', 'published')
    ])

    // 2. Prepare static URLs
    const staticUrls: SitemapUrl[] = [
      {
        url: baseUrl,
        language: 'en',
        last_modified: new Date(),
        priority: 1.0,
        change_frequency: 'daily',
        updated_at: new Date()
      },
      {
        url: `${baseUrl}/en`,
        language: 'en',
        last_modified: new Date(),
        priority: 0.9,
        change_frequency: 'daily',
        updated_at: new Date()
      },
      {
        url: `${baseUrl}/es`,
        language: 'es',
        last_modified: new Date(),
        priority: 0.9,
        change_frequency: 'daily',
        updated_at: new Date()
      }
    ]

    // Define paths configuration
    const paths: PathConfig = {
      restaurant: { en: '', es: '' },
      neighborhood: { en: '', es: '' },
      category: { en: '', es: '' },
      guide: { en: 'guides/', es: 'guias/' }
    }

    // 3. Generate bilingual URLs for each content type
    const generateBilingualUrls = (
      items: DatabaseItem[] | null, 
      contentType: ContentType, 
      priority: number
    ): SitemapUrl[] => {
      if (!items) return []
      
      return items.flatMap(item => [
        {
          url: `${baseUrl}/en/${paths[contentType].en}${item.slug}`,
          language: 'en',
          last_modified: new Date(item.updated_at),
          priority,
          change_frequency: 'weekly',
          updated_at: new Date()
        },
        {
          url: `${baseUrl}/es/${paths[contentType].es}${item.slug}`,
          language: 'es',
          last_modified: new Date(item.updated_at),
          priority,
          change_frequency: 'weekly',
          updated_at: new Date()
        }
      ])
    }

    // 4. Combine all URLs
    const allUrls = [
      ...staticUrls,
      ...generateBilingualUrls(restaurants, 'restaurant', 0.8),
      ...generateBilingualUrls(neighborhoods, 'neighborhood', 0.7),
      ...generateBilingualUrls(categories, 'category', 0.7),
      ...generateBilingualUrls(guides, 'guide', 0.9)
    ]

    // 5. Update sitemap_urls table
    const { error } = await supabase
      .from('sitemap_urls')
      .upsert(allUrls, { 
        onConflict: 'url',
        ignoreDuplicates: false
      })

    if (error) {
      throw error
    }

    return {
      success: true,
      urlCount: allUrls.length,
      timestamp: new Date()
    }

  } catch (error) {
    console.error('Error updating sitemap URLs:', error)
    return {
      success: false,
      error,
      timestamp: new Date()
    }
  }
}