"use client";

import { useState } from "react";
import Image from "next/image";
import { Images } from "lucide-react";
import ImageLightbox from "@/components/ui/ImageLightbox";
import styles from "./ProjectGallery.module.css";

interface Props {
  coverImage:    string | null;
  galleryImages: string[];
  title:         string;
}

export default function ProjectGallery({ coverImage, galleryImages, title }: Props) {
  /* Combine cover + gallery into one ordered array */
  const all = [
    ...(coverImage ? [coverImage] : []),
    ...galleryImages,
  ];

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (all.length === 0) return null;

  const open  = (i: number) => setLightboxIndex(i);
  const close = () => setLightboxIndex(null);
  const prev  = () => setLightboxIndex((i) => ((i ?? 0) - 1 + all.length) % all.length);
  const next  = () => setLightboxIndex((i) => ((i ?? 0) + 1) % all.length);

  return (
    <section className={styles.root}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <Images size={16} />
          Project Images
          <span className={styles.count}>{all.length}</span>
        </h2>
      </div>

      <div className={styles.grid} data-count={Math.min(all.length, 6)}>
        {all.map((url, i) => (
          <button
            key={url}
            className={`${styles.cell} ${i === 0 ? styles.cellFeatured : ""}`}
            onClick={() => open(i)}
            aria-label={`View image ${i + 1} of ${all.length}`}
          >
            <Image
              src={url}
              alt={`${title} — image ${i + 1}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={styles.img}
              unoptimized={!url.startsWith("https://images.unsplash")}
            />
            <div className={styles.cellOverlay} />
            {i === 0 && all.length > 1 && (
              <span className={styles.featuredLabel}>Cover</span>
            )}
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <ImageLightbox
          images={all}
          index={lightboxIndex}
          onClose={close}
          onPrev={prev}
          onNext={next}
        />
      )}
    </section>
  );
}
