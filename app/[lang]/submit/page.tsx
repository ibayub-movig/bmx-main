import { Locale, locales } from '@/lib/i18n';
import Link from 'next/link';
import { ChevronRight, Home, Send } from 'lucide-react';
import { SubmitFormWrapper } from './components/submit-form';
import { Metadata } from 'next';

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params: { lang } }: { params: { lang: Locale } }): Promise<Metadata> {
  return {
    title: lang === 'en' ? 'Submit a Restaurant | BestCDMX' : 'Enviar un Restaurante | BestCDMX',
    description: lang === 'en'
      ? 'Submit your favorite restaurant to be featured on BestCDMX. Help us discover the best places to eat in Mexico City.'
      : 'Envía tu restaurante favorito para ser destacado en BestCDMX. Ayúdanos a descubrir los mejores lugares para comer en la Ciudad de México.',
    alternates: {
      languages: {
        en: '/en/submit',
        es: '/es/submit',
      },
    },
  };
}

export default function SubmitPage({ params: { lang } }: { params: { lang: Locale } }) {
  return (
    <div>
      {/* Breadcrumbs */}
      <div className="border-b">
        <nav className="container mx-auto px-4 py-3">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href={`/${lang}`} className="text-muted-foreground hover:text-foreground flex items-center">
                <Home className="h-4 w-4" />
              </Link>
            </li>
            <li>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </li>
            <li>
              <span className="font-medium">
                {lang === 'en' ? 'Submit a Restaurant' : 'Enviar un Restaurante'}
              </span>
            </li>
          </ol>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-12 h-12 text-primary mx-auto mb-4">
              <Send className="w-full h-full" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              {lang === 'en' ? 'Submit a Restaurant' : 'Enviar un Restaurante'}
            </h1>
            <p className="text-lg text-muted-foreground">
              {lang === 'en' 
                ? 'Know a great restaurant that should be on BestCDMX? Let us know about it!'
                : '¿Conoces un restaurante que debería estar en BestCDMX? ¡Cuéntanos sobre él!'}
            </p>
          </div>

          <SubmitFormWrapper />
        </div>
      </div>
    </div>
  );
}