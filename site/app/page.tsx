import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { HomeStory } from "@/components/site/home-story";
import { SITE } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = { alternates: { canonical: SITE.url } };

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main">
        <HomeStory />
      </main>
      <Footer />
    </>
  );
}
