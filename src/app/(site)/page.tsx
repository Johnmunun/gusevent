import { Hero } from "@/components/landing/Hero";
import { Services } from "@/components/landing/Services";
import { Gallery } from "@/components/landing/Gallery";
import { Testimonials } from "@/components/landing/Testimonials";
import { WhyChooseUs } from "@/components/landing/WhyChooseUs";
import { CTA } from "@/components/landing/CTA";
import { getLandingCms } from "@/lib/cms/get-content";

export default async function HomePage() {
  const cms = await getLandingCms();

  return (
    <>
      <Hero content={cms.hero} stats={cms.stats} />
      <Services content={cms.services} />
      <Gallery content={cms.gallery} />
      <Testimonials content={cms.testimonials} />
      <WhyChooseUs content={cms.about} />
      <CTA content={cms.cta} />
    </>
  );
}
