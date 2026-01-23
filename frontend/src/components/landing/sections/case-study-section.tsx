import { SparklesIcon } from "lucide-react";

import SpotlightCard from "@/components/ui/spotlight-card";

import { Section } from "../section";

export function CaseStudySection({ className }: { className?: string }) {
  const caseStudies = [
    {
      title: "2025 Survey",
      description:
        "A 12,000-word research report analyzing 47 papers on brain-inspired chips, covering Intel Loihi 2, IBM NorthPole, and SynSense's edge AI solutions.",
    },
    {
      title: "Indie Hacker's SaaS Landing Page",
      description:
        "A fully responsive landing page with hero section, pricing table, testimonials, and Stripe integration — shipped in one conversation.",
    },
    {
      title: "Transformer Architecture Explained",
      description:
        "A 25-slide presentation breaking down self-attention, positional encoding, and KV-cache with hand-drawn style diagrams for a university lecture.",
    },
    {
      title: "DeerDeer Explains RAG",
      description:
        "A series of 12 illustrations featuring a curious deer mascot explaining Retrieval-Augmented Generation through a library adventure story.",
    },
    {
      title: "AI Weekly: Your Tech Podcast",
      description:
        "A 20-minute podcast episode where two AI hosts debate whether AI agents will replace traditional SaaS, based on 5 articles you provided.",
    },
    {
      title: "How Diffusion Models Work",
      description:
        "A 3-minute animated explainer video visualizing the denoising process, from pure noise to a generated image, with voiceover narration.",
    },
  ];
  return (
    <Section
      className={className}
      title="Case Studies"
      subtitle="See how DeerFlow is used in the wild"
    >
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {caseStudies.map((caseStudy) => (
          <SpotlightCard className="h-64" key={caseStudy.title}>
            <div className="flex h-full w-full flex-col items-center justify-center">
              <div className="flex w-75 flex-col gap-4">
                <div>
                  <SparklesIcon className="text-primary size-8" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-2xl font-bold">{caseStudy.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {caseStudy.description}
                  </p>
                </div>
              </div>
            </div>
          </SpotlightCard>
        ))}
      </div>
    </Section>
  );
}
