// app/api/update-sitemap/route.ts
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const baseUrl = 'https://www.bestcdmx.com'

// Define all static pages and their priorities
const staticPages = [
  { path: '', priority: 1.0 },                    // Homepage
  { path: '/en', priority: 0.9 },                 // English root
  { path: '/es', priority: 0.9 },                 // Spanish root
  { path: '/en/restaurants', priority: 0.8 },     // English restaurants list
  { path: '/es/restaurants', priority: 0.8 },     // Spanish restaurants list
  { path: '/en/guides', priority: 0.7 },          // English guides list
  { path: '/es/guides', priority: 0.7 },          // Spanish guides list
  { path: '/en/neighborhoods', priority: 0.7 },   // English neighborhoods list
  { path: '/es/neighborhoods', priority: 0.7 },   // Spanish neighborhoods list
  { path: '/en/cuisines', priority: 0.7 },        // English cuisines list
  { path: '/es/cuisines', priority: 0.7 },        // Spanish cuisines list
  { path: '/en/submit', priority: 0.6 },          // English submit
  { path: '/es/submit', priority: 0.6 }           // Spanish submit
]

async function updateSitemapUrls() {
  try {
    // Clear existing entries
    const { error: deleteError } = await supabase
      .from('sitemap_urls')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (deleteError) throw deleteError

    // Fetch all dynamic content
    const [restaurants, neighborhoods, guides, cuisines] = await Promise.all([
      supabase
        .from('restaurants')
        .select('slug, updated_at')
        .eq('status', 'published'),
      supabase
        .from('neighborhoods')
        .select('slug, updated_at'),
      supabase
        .from('guides')
        .select('slug, updated_at'),
      supabase
        .from('categories')  // This is where cuisines are stored
        .select('slug, updated_at')
    ])

    // Generate static page URLs
    const staticUrls = staticPages.map(page => ({
      id: randomUUID(),
      url: `${baseUrl}${page.path}`,
      language: page.path.includes('/es/') ? 'es' : 'en',
      last_modified: new Date(),
      priority: page.priority,
      change_frequency: 'daily',
      updated_at: new Date()
    }))

    // Generate dynamic content URLs
    const dynamicUrls = [
      // Restaurants
      ...restaurants.data?.flatMap(item => ([
        {
          id: randomUUID(),
          url: `${baseUrl}/en/restaurants/${item.slug}`,
          language: 'en',
          last_modified: new Date(item.updated_at),
          priority: 0.8,
          change_frequency: 'weekly',
          updated_at: new Date()
        },
        {
          id: randomUUID(),
          url: `${baseUrl}/es/restaurants/${item.slug}`,
          language: 'es',
          last_modified: new Date(item.updated_at),
          priority: 0.8,
          change_frequency: 'weekly',
          updated_at: new Date()
        }
      ])) || [],

      // Neighborhoods
      ...neighborhoods.data?.flatMap(item => ([
        {
          id: randomUUID(),
          url: `${baseUrl}/en/neighborhoods/${item.slug}`,
          language: 'en',
          last_modified: new Date(item.updated_at),
          priority: 0.7,
          change_frequency: 'weekly',
          updated_at: new Date()
        },
        {
          id: randomUUID(),
          url: `${baseUrl}/es/neighborhoods/${item.slug}`,
          language: 'es',
          last_modified: new Date(item.updated_at),
          priority: 0.7,
          change_frequency: 'weekly',
          updated_at: new Date()
        }
      ])) || [],

      // Guides
      ...guides.data?.flatMap(item => ([
        {
          id: randomUUID(),
          url: `${baseUrl}/en/guides/${item.slug}`,
          language: 'en',
          last_modified: new Date(item.updated_at),
          priority: 0.9,
          change_frequency: 'weekly',
          updated_at: new Date()
        },
        {
          id: randomUUID(),
          url: `${baseUrl}/es/guides/${item.slug}`,
          language: 'es',
          last_modified: new Date(item.updated_at),
          priority: 0.9,
          change_frequency: 'weekly',
          updated_at: new Date()
        }
      ])) || [],

      // Cuisines (from categories table)
      ...cuisines.data?.flatMap(item => ([
        {
          id: randomUUID(),
          url: `${baseUrl}/en/cuisines/${item.slug}`,
          language: 'en',
          last_modified: new Date(item.updated_at),
          priority: 0.7,
          change_frequency: 'weekly',
          updated_at: new Date()
        },
        {
          id: randomUUID(),
          url: `${baseUrl}/es/cuisines/${item.slug}`,
          language: 'es',
          last_modified: new Date(item.updated_at),
          priority: 0.7,
          change_frequency: 'weekly',
          updated_at: new Date()
        }
      ])) || []
    ]

    const allUrls = [...staticUrls, ...dynamicUrls]

    // Insert all URLs
    const { error: insertError } = await supabase
      .from('sitemap_urls')
      .insert(allUrls)

    if (insertError) throw insertError

    return new Response(JSON.stringify({ 
      success: true, 
      count: allUrls.length
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Error updating sitemap:', error)
    return new Response(JSON.stringify({ success: false, error }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}

export async function GET() {
  return updateSitemapUrls()
}

export async function POST() {
  return updateSitemapUrls()
}