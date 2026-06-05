import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileStickyCTA } from "@/components/layout/MobileStickyCTA";
import { DevisDrawerProvider } from "@/components/devis/DevisDrawerProvider";
import { getLandingCms } from "@/lib/cms/get-content";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cms = await getLandingCms();

  return (
    <DevisDrawerProvider>
      <Header />
      <main className="w-full max-w-[100vw] overflow-x-clip pb-28 md:pb-0">
        {children}
      </main>
      <Footer content={cms.footer} />
      <MobileStickyCTA />
    </DevisDrawerProvider>
  );
}
