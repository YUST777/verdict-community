import { HeroSection } from "@/components/ui/hero-section-1"
import FUIBentoGridDark from "@/components/ui/bento"
import Pricing from "@/components/ui/pricing"
import { Faq } from "@/components/ui/faq"
import { Footer } from "@/components/ui/footer-7"

export default function Home() {
  return (
    <main>
      <HeroSection />
      <FUIBentoGridDark />
      <Pricing />
      <Faq />
      <Footer />
    </main>
  )
}
