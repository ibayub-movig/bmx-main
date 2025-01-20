// app/sitemap.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function sitemap() {
  const { data: sitemapUrls } = await supabase
    .from('sitemap_urls')
    .select('*')
    .order('priority', { ascending: false })

  if (!sitemapUrls) return []

  return sitemapUrls.map((entry) => ({
    url: entry.url,
    lastModified: entry.last_modified,
    changeFrequency: entry.change_frequency,
    priority: entry.priority,
  }))
}