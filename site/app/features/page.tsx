import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Features" };

export default function FeaturesPage() {
  redirect("/#features");
}
