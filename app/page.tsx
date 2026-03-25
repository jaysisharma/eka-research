import Hero from "@/components/sections/Hero";
import ResearchAreas from "@/components/sections/ResearchAreas";
import About from "@/components/sections/About";
import FeaturedProjects from "@/components/sections/FeaturedProjects";
import Events from "@/components/sections/Events";
import JoinCTA from "@/components/sections/JoinCTA";

export default function Home() {
  return (
    <main>
      <Hero />
      <ResearchAreas />
      <About />
      <FeaturedProjects />
      <Events />
      <JoinCTA />
    </main>
  );
}
