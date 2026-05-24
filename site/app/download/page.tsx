import type { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { DownloadHero } from "./download-hero";

export const metadata: Metadata = {
  title: "Download Fotoro",
  description:
    "Download Fotoro for macOS, Windows, Linux, Android and iOS. One binary. No telemetry. Pair every device with a QR scan.",
};

export default function DownloadPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="pt-28">
        <DownloadHero />
      </main>
      <Footer />
    </>
  );
}
