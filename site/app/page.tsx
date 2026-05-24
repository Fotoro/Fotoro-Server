import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Hero } from "@/components/site/hero";
import { LogosStrip } from "@/components/site/logos-strip";
import { ValueProp } from "@/components/site/value-prop";
import { FeaturesBento } from "@/components/site/features-bento";
import { HowItWorks } from "@/components/site/how-it-works";
import { SearchDemo } from "@/components/site/search-demo";
import { IntelligenceLayer } from "@/components/site/intelligence-layer";
import { Roadmap } from "@/components/site/roadmap";
import { WhoItsFor } from "@/components/site/who-its-for";
import { Pricing } from "@/components/site/pricing";
import { DownloadSection } from "@/components/site/download-section";
import { Testimonials } from "@/components/site/testimonials";
import { FinalCTA } from "@/components/site/final-cta";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <LogosStrip />
        <ValueProp />
        <FeaturesBento />
        <HowItWorks />
        <SearchDemo />
        <IntelligenceLayer />
        <Roadmap />
        <WhoItsFor />
        <Pricing />
        <DownloadSection />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
