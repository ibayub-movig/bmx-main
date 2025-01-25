// app/[lang]/layout.tsx
import { Locale, dictionary } from '@/lib/i18n';
import { NavigationMenu } from '@/components/navigation-menu';
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
    <>
      <NavigationMenu lang={lang} dictionary={t} />
      <main className="min-h-screen">{children}</main>
      <Footer lang={lang} />
    </>
  );
}