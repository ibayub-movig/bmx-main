import { Locale } from '@/lib/i18n';
import Link from 'next/link';
import { BookOpen, Utensils, MapPin, Compass, Info, Send } from 'lucide-react';

type FooterProps = {
  lang: Locale;
};

export function Footer({ lang }: FooterProps) {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Restaurants Column */}
          <div>
            <h2 className="font-semibold text-lg mb-4 flex items-center">
              <Utensils className="w-5 h-5 mr-2" />
              {lang === 'en' ? 'Restaurants' : 'Restaurantes'}
            </h2>
            <ul className="space-y-2">
              <li>
                <Link 
                  href={`/${lang}/restaurants`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {lang === 'en' ? 'All Restaurants' : 'Todos los Restaurantes'}
                </Link>
              </li>
              <li>
                <Link 
                  href={`/${lang}/cuisines`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {lang === 'en' ? 'Browse by Cuisine' : 'Explorar por Cocina'}
                </Link>
              </li>
              <li>
                <Link 
                  href={`/${lang}/restaurants?p=$,$$`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {lang === 'en' ? 'Budget-Friendly' : 'Económicos'}
                </Link>
              </li>
              <li>
                <Link 
                  href={`/${lang}/restaurants?p=$$$$`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {lang === 'en' ? 'Fine Dining' : 'Alta Cocina'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Neighborhoods Column */}
          <div>
            <h2 className="font-semibold text-lg mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              {lang === 'en' ? 'Neighborhoods' : 'Colonias'}
            </h2>
            <ul className="space-y-2">
              <li>
                <Link 
                  href={`/${lang}/neighborhoods`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {lang === 'en' ? 'All Neighborhoods' : 'Todas las Colonias'}
                </Link>
              </li>
            </ul>
          </div>

          {/* About Column */}
          <div>
            <h2 className="font-semibold text-lg mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              {lang === 'en' ? 'Guides' : 'Guías'}
            </h2>
            <ul className="space-y-2">
              <li>
                <Link 
                  href={`/${lang}/guides`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {lang === 'en' ? 'All Guides' : 'Todas las Guías'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Submit Column */}
          <div>
            <h2 className="font-semibold text-lg mb-4 flex items-center">
              <Send className="w-5 h-5 mr-2" />
              {lang === 'en' ? 'Submit' : 'Enviar'}
            </h2>
            <ul className="space-y-2">
              <li>
                <Link 
                  href={`/${lang}/submit`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {lang === 'en' ? 'Submit a Restaurant' : 'Enviar un Restaurante'}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} BestCDMX. {lang === 'en' ? 'All rights reserved.' : 'Todos los derechos reservados.'}
            </p>
            <div className="flex items-center gap-4">
              <Link 
                href={`/${lang === 'en' ? 'es' : 'en'}${lang === 'en' ? '/restaurants' : '/restaurantes'}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {lang === 'en' ? 'Español' : 'English'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}