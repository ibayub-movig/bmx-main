export const defaultLocale = 'en';
export const locales = ['en', 'es'] as const;
export type Locale = typeof locales[number];

type Dictionary = {
  [K in Locale]: {
    'nav.restaurants': string;
    'nav.guides': string;
    'nav.submit': string;
    'hero.title': string;
    'hero.subtitle': string;
    'categories.restaurants': string;
    'categories.attractions': string;
    'categories.nightlife': string;
    'categories.culture': string;
  }
};

export const dictionary: Dictionary = {
  en: {
    'nav.restaurants': 'Restaurants',
    'nav.guides': 'Guides',
    'nav.submit': 'Submit',
    'hero.title': 'Discover Mexico City',
    'hero.subtitle': 'Your guide to the best places in CDMX',
    'categories.restaurants': 'Restaurants',
    'categories.attractions': 'Attractions',
    'categories.nightlife': 'Nightlife',
    'categories.culture': 'Culture',
  },
  es: {
    'nav.restaurants': 'Restaurantes',
    'nav.guides': 'Guías',
    'nav.submit': 'Enviar',
    'hero.title': 'Descubre la Ciudad de México',
    'hero.subtitle': 'Tu guía de los mejores lugares en CDMX',
    'categories.restaurants': 'Restaurantes',
    'categories.attractions': 'Atracciones',
    'categories.nightlife': 'Vida Nocturna',
    'categories.culture': 'Cultura',
  },
};