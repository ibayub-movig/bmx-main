'use client'

import { useAnalytics } from '@/lib/hooks/useAnalytics'

export function RestaurantCard({ restaurant }) {
  const { trackEvent } = useAnalytics()

  const handleClick = () => {
    trackEvent('restaurant_view', {
      restaurant_id: restaurant.id,
      restaurant_name: restaurant.name,
    })
    // ... rest of click handler
  }

  return (
    // ... your component JSX
  )
} 