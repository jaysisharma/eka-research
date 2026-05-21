import PageHero from "@/components/ui/PageHero";
import { buildMetadata } from "@/lib/seo";
import { getPublishedNews } from "@/lib/news";
import NewsCatalogExplorer from "@/components/news/NewsCatalogExplorer";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "News",
  description:
    "The latest updates from Eka Research — new publications, project milestones, event announcements, and science news from Nepal.",
  path: "/news",
});

export default async function NewsPage() {
  const allNews = await getPublishedNews();

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      {/* ── 1. Hero ── */}
      <PageHero
        label="News"
        title="What&apos;s happening at "
        accentWord="Eka Research"
        description="Publications, project milestones, event announcements, and science updates from our team in Kathmandu."
        align="left"
        variant="dark"
      />

      {/* ── 2. Client Explorer ── */}
      <NewsCatalogExplorer newsPosts={allNews} />
    </main>
  );
}
