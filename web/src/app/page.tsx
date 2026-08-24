import { Hero } from "@/components/sections/hero";
import { SelectedWork } from "@/components/sections/selected-work";
import { CapabilitiesPreview } from "@/components/sections/capabilities-preview";
import { LabPreview } from "@/components/sections/lab-preview";
import { Process } from "@/components/sections/process";
import { AboutPreview } from "@/components/sections/about-preview";
import { Cta } from "@/components/sections/cta";
import { siteConfig } from "@/lib/site-config";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  founder: {
    "@type": "Person",
    name: "Fahad",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <Hero />
      <SelectedWork />
      <CapabilitiesPreview />
      <LabPreview />
      <Process />
      <AboutPreview />
      <Cta />
    </>
  );
}
