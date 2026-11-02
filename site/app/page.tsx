import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Hero } from "@/components/site/hero";
import { ValueProp } from "@/components/site/value-prop";
import { ProductTheatre } from "@/components/site/product-theatre";
import { FinalCTA } from "@/components/site/final-cta";
import { SITE } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = { alternates: { canonical: SITE.url } };

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <ProductTheatre />
        <ValueProp />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
