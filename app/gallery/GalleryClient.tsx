"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Search, Image as ImageIcon, ChevronLeft, ChevronRight,
  X, ExternalLink, Download, Sparkles
} from "lucide-react";
import styles from "./page.module.css";

interface GalleryImage {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  category: string;
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GalleryClientProps {
  initialImages: GalleryImage[];
}

const CATEGORY_TABS = [
  { value: "ALL", label: "All Works" },
  { value: "astrophotography", label: "Astrophotography" },
  { value: "research", label: "Research Operations" },
  { value: "facilities", label: "Facilities & Labs" },
  { value: "community", label: "Community & Outreach" },
];

export default function GalleryClient({ initialImages }: GalleryClientProps) {
  const [images] = useState<GalleryImage[]>(initialImages);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Derived filtered images
  const filteredImages = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return images.filter((img) => {
      const matchTab = activeTab === "ALL" || img.category === activeTab;
      const matchQuery =
        !q ||
        img.title.toLowerCase().includes(q) ||
        (img.description || "").toLowerCase().includes(q);
      return matchTab && matchQuery;
    });
  }, [images, activeTab, searchQuery]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxIndex(null);
      } else if (e.key === "ArrowRight") {
        setLightboxIndex((prev) =>
          prev !== null && prev < filteredImages.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev !== null && prev > 0 ? prev - 1 : filteredImages.length - 1
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, filteredImages]);

  const activeImage = lightboxIndex !== null ? filteredImages[lightboxIndex] : null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) =>
        prev !== null && prev > 0 ? prev - 1 : filteredImages.length - 1
      );
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) =>
        prev !== null && prev < filteredImages.length - 1 ? prev + 1 : 0
      );
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* HERO SECTION */}
        <header className={styles.hero}>
          <div className={styles.heroGlow} />
          <h1 className={styles.title}>
            Science <span className={styles.highlight}>Gallery</span>
          </h1>
          <p className={styles.subtitle}>
            Explore the cosmos and Eka Research's operations through real-time observation imaging, high-altitude balloon telemetry, and local outreach snapshots.
          </p>
        </header>

        {/* TOOLBAR */}
        <section className={styles.toolbar}>
          {/* TAB FILTERS */}
          <div className={styles.tabs} role="tablist">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.value}
                role="tab"
                aria-selected={activeTab === tab.value}
                className={`${styles.tab} ${activeTab === tab.value ? styles.tabActive : ""}`}
                onClick={() => {
                  setActiveTab(tab.value);
                  setLightboxIndex(null);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* SEARCH BAR */}
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search images or context stories..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </section>

        {/* IMAGE GRID */}
        {filteredImages.length === 0 ? (
          <div className={styles.emptyState}>
            <ImageIcon size={48} className={styles.emptyIcon} />
            <h3>No cosmic captures found</h3>
            <p>We couldn't find any images matching "{searchQuery}". Try revising your search terms or checking another category tab.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredImages.map((img, index) => (
              <article
                key={img.id}
                className={styles.card}
                onClick={() => setLightboxIndex(index)}
              >
                <div className={styles.imageWrap}>
                  <Image
                    src={img.imageUrl}
                    alt={img.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className={styles.image}
                    loading="lazy"
                    unoptimized
                  />
                  <div className={styles.overlay}>
                    <span className={styles.cardCategory}>
                      {img.category === "astrophotography"
                        ? "Astrophotography"
                        : img.category === "research"
                        ? "Research Ops"
                        : img.category === "facilities"
                        ? "Facilities"
                        : "Outreach & Community"}
                    </span>
                    <h3 className={styles.cardTitle}>{img.title}</h3>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* FULL-SCREEN LIGHTBOX OVERLAY */}
      {activeImage && (
        <div
          className={styles.lightboxOverlay}
          onClick={() => setLightboxIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          {/* HEADER */}
          <header className={styles.lightboxHeader} onClick={(e) => e.stopPropagation()}>
            <span className={styles.lightboxCount}>
              Image {lightboxIndex !== null ? lightboxIndex + 1 : 0} of {filteredImages.length}
            </span>
            <button
              className={styles.closeLightbox}
              onClick={() => setLightboxIndex(null)}
              aria-label="Close details"
            >
              <X size={20} />
            </button>
          </header>

          {/* MAIN LIGHTBOX CONTENT AREA */}
          <div className={styles.lightboxMain}>
            {/* Nav Arrows */}
            <button
              className={`${styles.navArrow} ${styles.arrowLeft}`}
              onClick={handlePrev}
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>

            <div className={styles.imageContainer}>
              <div className={styles.lightboxImgWrap}>
                <Image
                  src={activeImage.imageUrl}
                  alt={activeImage.title}
                  fill
                  className={styles.lightboxImg}
                  unoptimized
                />
              </div>
            </div>

            <button
              className={`${styles.navArrow} ${styles.arrowRight}`}
              onClick={handleNext}
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>

            {/* DETAILS PANEL */}
            <aside className={styles.detailsPanel} onClick={(e) => e.stopPropagation()}>
              <div>
                <span className={styles.panelCategory}>
                  {activeImage.category === "astrophotography"
                    ? "Astrophotography"
                    : activeImage.category === "research"
                    ? "Research Operations"
                    : activeImage.category === "facilities"
                    ? "Facilities & Labs"
                    : "Outreach & Community"}
                </span>
                <h2 className={styles.panelTitle}>{activeImage.title}</h2>
                <div className={styles.panelDivider} />
                {activeImage.description ? (
                  <p className={styles.panelDescription}>{activeImage.description}</p>
                ) : (
                  <p className={styles.panelDescription} style={{ opacity: 0.5, fontStyle: "italic" }}>
                    No technical context or backstory has been provided for this image.
                  </p>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className={styles.actionsRow}>
                <a
                  href={activeImage.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.actionButton} ${styles.btnPrimary}`}
                >
                  <ExternalLink size={14} /> View Full Resolution
                </a>
                <a
                  href={activeImage.imageUrl}
                  download={activeImage.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.actionButton} ${styles.btnSecondary}`}
                >
                  <Download size={14} /> Download Media
                </a>
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}
