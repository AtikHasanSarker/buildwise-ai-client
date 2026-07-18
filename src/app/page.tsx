import type { Metadata } from "next";
import { HomeContent } from "@/components/home/HomeContent";

export const metadata: Metadata = {
  title: "BuildWise AI — AI-Powered PC Build Marketplace",
  description:
    "Let our AI assistant find compatible components, optimize your budget, and build the perfect setup. Browse thousands of parts with intelligent compatibility checking.",
  openGraph: {
    title: "BuildWise AI — AI-Powered PC Build Marketplace",
    description:
      "Let our AI assistant find compatible components, optimize your budget, and build the perfect setup.",
    type: "website",
  },
};

export default function Home() {
  return <HomeContent />;
}
