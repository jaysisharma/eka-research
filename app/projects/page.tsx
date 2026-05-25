export const dynamic = "force-dynamic";

import PageHero from "@/components/ui/PageHero";
import { buildMetadata } from "@/lib/seo";
import { PROJECTS, type Project, type ProjectStatus } from "@/lib/constants";
import { db } from "@/lib/db";
import ProjectCatalogExplorer from "@/components/projects/ProjectCatalogExplorer";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: "Projects",
  description:
    "Explore Eka Research's active, completed, and upcoming projects — from the All Sky Camera network to stratospheric balloon missions and solar eclipse expeditions.",
  path: "/projects",
});

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  // Extract initial status tab if any is requested in search params
  const { status } = await searchParams;
  const initialStatus = (status as string) || "all";

  // Query projects from database dynamically
  let rawDbProjects: any[] = [];
  try {
    rawDbProjects = await db.project.findMany({
      where: { published: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to query projects from database:", error);
  }

  // Parse and map database projects to our standardized Project interface
  let loadedProjects: Project[] = [];
  if (rawDbProjects && rawDbProjects.length > 0) {
    loadedProjects = rawDbProjects.map((dbProj) => {
      let parsedTags: string[] = [];
      try {
        parsedTags = dbProj.tags ? JSON.parse(dbProj.tags) : [];
        if (!Array.isArray(parsedTags)) {
          parsedTags = [];
        }
      } catch (e) {
        parsedTags = dbProj.tags
          ? dbProj.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
          : [];
      }

      let parsedImages: string[] = [];
      try {
        const raw = JSON.parse(dbProj.images ?? "[]");
        parsedImages = Array.isArray(raw) ? raw : [];
      } catch { parsedImages = []; }

      return {
        id: dbProj.id,
        title: dbProj.title,
        description: dbProj.description,
        status: dbProj.status as ProjectStatus,
        period: dbProj.period,
        tags: parsedTags,
        image: dbProj.imageUrl || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
        images: parsedImages,
        href: dbProj.href || `/projects/${dbProj.id}`,
        featured: dbProj.featured,
        outcome: dbProj.outcome || undefined,
        phase: dbProj.phase || undefined,
        launchTarget: dbProj.launchTarget || undefined,
      };
    });
  } else {
    // Seamless fallback to our static high-quality PROJECTS constant array
    loadedProjects = PROJECTS;
  }

  return (
    <main className={styles.main}>
      <PageHero
        label="Projects"
        title="Instruments in the field. "
        accentWord="Science in motion."
        description="From real-time sky surveillance to stratospheric ballooning — every Eka project generates data that matters and knowledge that's shared freely."
        align="left"
        variant="dark"
        cta={{ label: "Explore all work", href: "#explorer" }}
        ctaSecondary={{ label: "View publications", href: "/articles" }}
      />

      <section className={styles.explorerSection} id="explorer">
        <div className={styles.explorerInner}>
          <ProjectCatalogExplorer
            projects={loadedProjects}
            initialStatus={initialStatus}
          />
        </div>
      </section>
    </main>
  );
}
