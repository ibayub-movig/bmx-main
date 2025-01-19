'use client'

export const useAnalytics = () => {
  const trackEvent = (action: string, parameters?: Record<string, string>) => {
    if (typeof window !== 'undefined' && 'gtag' in window) {
      window.gtag('event', action, parameters)
    }
  }

  return { trackEvent }
} 