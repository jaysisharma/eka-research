import { buildMetadata } from "@/lib/seo";
import { getPublishedArticles } from "@/lib/research";
import { auth } from "@/lib/auth";
import PapersList from "./PapersList";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: "Research Papers",
  description:
    "Browse all peer-reviewed papers, conference proceedings, and preprints published by Eka Research — covering meteor science, atmospheric physics, space weather, and more.",
  path: "/research",
});


export const dynamic = "force-dynamic";

export default async function ResearchPage() {
  const [articles, session] = await Promise.all([
    getPublishedArticles(),
    auth(),
  ]);

  const isPaidUser =
    session?.user?.role === "PAID_MEMBER" || session?.user?.role === "ADMIN";

  return (
    <main className={styles.page}>
      <div className={styles.spaceGrid} aria-hidden="true" />
      <div className={styles.nebulaGlow1} aria-hidden="true" />
      <div className={styles.nebulaGlow2} aria-hidden="true" />

      <div className={styles.inner}>

        {/* ── Page header ── */}
        <header className={styles.pageHeader}>
          <span className={styles.label}>
            <span className={styles.labelLine} />
            Publications
          </span>
          <div className={styles.headerRow}>
            <h1 className={styles.pageTitle}>Research Papers</h1>
            <span className={styles.paperCount}>{articles.length} papers</span>
          </div>
          <p className={styles.pageDesc}>
            Original science from Eka Research — peer-reviewed journals, conference proceedings, and preprints.
            Gold-highlighted names are Eka Research members.
          </p>
        </header>

        {/* ── Interactive list (client component) ── */}
        <PapersList articles={articles} isPaidUser={isPaidUser} />

      </div>
    </main>
  );
}
