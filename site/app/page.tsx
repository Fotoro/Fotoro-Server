import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Hero } from "@/components/site/hero";
import { LogosStrip } from "@/components/site/logos-strip";
import { ValueProp } from "@/components/site/value-prop";
import { FinalCTA } from "@/components/site/final-cta";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <LogosStrip />
        <ValueProp />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
