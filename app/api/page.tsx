// app/update-sitemap/page.tsx
'use client'
 
export default function UpdateSitemap() {
  const updateSitemap = async () => {
    const res = await fetch('/api/update-sitemap', { method: 'POST' })
    const data = await res.json()
    alert(data.success ? `Updated ${data.count} URLs` : 'Error updating sitemap')
  }

  return <button onClick={updateSitemap}>Update Sitemap</button>
}