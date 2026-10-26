import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Hero } from "@/components/site/hero";
import { ValueProp } from "@/components/site/value-prop";
import { FinalCTA } from "@/components/site/final-cta";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <ValueProp />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
