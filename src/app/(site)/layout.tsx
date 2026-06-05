import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileStickyCTA } from "@/components/layout/MobileStickyCTA";
import { DevisDrawerProvider } from "@/components/devis/DevisDrawerProvider";
import { ToastProvider } from "@/components/ui/toast-context";
import { ContactProvider } from "@/components/contact/ContactProvider";
import { getLandingCms } from "@/lib/cms/get-content";
import { getContactSettings } from "@/lib/settings/contact-settings";
import { getLogoSettings } from "@/lib/settings/logo-settings";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [cms, logo, contact] = await Promise.all([
    getLandingCms(),
    getLogoSettings(),
    getContactSettings(),
  ]);

  return (
    <ToastProvider>
      <ContactProvider contact={contact}>
        <DevisDrawerProvider>
          <Header branding={logo} />
          <main className="w-full max-w-[100vw] overflow-x-clip pb-28 md:pb-0">
            {children}
          </main>
          <Footer content={cms.footer} branding={logo} contact={contact} />
          <MobileStickyCTA />
        </DevisDrawerProvider>
      </ContactProvider>
    </ToastProvider>
  );
}
