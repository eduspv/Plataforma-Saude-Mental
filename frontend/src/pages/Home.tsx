import HeroSection from "./landingPage/HeroSection";
import {NavbarPublic} from "../components/layout/NavbarPublic"
import ProblemSection from "./landingPage/ProblemSection";
import SolutionSection from "./landingPage/SolutionSection";
import HowItWorksSection from "./landingPage/HowItWorksSection";
import PricingSection from "./landingPage/PricingSection";
import FAQSection from "./landingPage/FAQSection";
import FinalCTASection from "./landingPage/FinalCTASection";
import FooterSection from "./landingPage/FooterSection";


export default function Home() {
  return (
    <main className="bg-white text-gray-900">
      <NavbarPublic/>     
      <HeroSection />
     <ProblemSection />
     <SolutionSection/>
     <HowItWorksSection/>
     <PricingSection />
     <FAQSection />
     <FinalCTASection />

<FooterSection />


    </main>
  );
}
