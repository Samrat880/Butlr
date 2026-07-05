import { AiTimelineSection } from "~/components/landing/ai-timeline";
import { ButlrFeaturesSection } from "~/components/landing/butlr-features";
import { ButlrFinalCta } from "~/components/landing/butlr-final-cta";
import { ButlrFooter } from "~/components/landing/butlr-footer";
import { ButlrHero } from "~/components/landing/butlr-hero";
import { ButlrNav } from "~/components/landing/butlr-nav";
import { FaqSection } from "~/components/landing/faq-section";
import { HowItWorksSection } from "~/components/landing/how-it-works";
import { LandingAuthActions } from "~/components/landing/landing-auth-actions";
import { MetricsSection } from "~/components/landing/metrics-section";
import { PricingSection } from "~/components/landing/pricing";
import { ProductShowcaseSection } from "~/components/landing/product-showcase";
import { TestimonialsSection } from "~/components/landing/testimonials-section";
import { ButlrBackground } from "~/components/butlr/background";

export default async function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div
        id="nav-scroll-sentinel"
        className="pointer-events-none absolute top-0 h-px w-full"
        aria-hidden
      />
      <ButlrBackground />
      <ButlrNav authActions={<LandingAuthActions />} />
      <main className="relative">
        <ButlrHero />
        <ProductShowcaseSection />
        <HowItWorksSection />
        <ButlrFeaturesSection />
        <AiTimelineSection />
        <MetricsSection />
        <TestimonialsSection />
        <PricingSection />
        <FaqSection />
        <ButlrFinalCta />
      </main>
      <ButlrFooter />
    </div>
  );
}
