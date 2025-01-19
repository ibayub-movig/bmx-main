import { Locale, dictionary } from '@/lib/i18n';
import { NavigationMenu } from '@/components/navigation-menu';
import { ThemeProvider } from '@/components/theme-provider';
import { Footer } from '@/components/footer';

export default function LangLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  const t = dictionary[lang];
  if (!t) return null;

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <NavigationMenu lang={lang} dictionary={t} />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer lang={lang} />
    </ThemeProvider>
  );
}