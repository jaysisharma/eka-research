"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./ImageLightbox.module.css";

interface Props {
  images:  string[];
  index:   number;
  onClose: () => void;
  onPrev:  () => void;
  onNext:  () => void;
}

export default function ImageLightbox({ images, index, onClose, onPrev, onNext }: Props) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape")      onClose();
      if (e.key === "ArrowLeft")   onPrev();
      if (e.key === "ArrowRight")  onNext();
    },
    [onClose, onPrev, onNext]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  const total = images.length;
  const src   = images[index];

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      {/* Counter */}
      <div className={styles.counter}>{index + 1} / {total}</div>

      {/* Close */}
      <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
        <X size={20} />
      </button>

      {/* Prev */}
      {total > 1 && (
        <button
          className={`${styles.navBtn} ${styles.navPrev}`}
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          aria-label="Previous image"
        >
          <ChevronLeft size={28} />
        </button>
      )}

      {/* Image */}
      <div className={styles.imgWrap} onClick={(e) => e.stopPropagation()}>
        <Image
          key={src}
          src={src}
          alt={`Image ${index + 1} of ${total}`}
          fill
          sizes="100vw"
          className={styles.img}
          unoptimized
          priority
        />
      </div>

      {/* Next */}
      {total > 1 && (
        <button
          className={`${styles.navBtn} ${styles.navNext}`}
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          aria-label="Next image"
        >
          <ChevronRight size={28} />
        </button>
      )}

      {/* Dot indicators */}
      {total > 1 && (
        <div className={styles.dots}>
          {images.map((_, i) => (
            <span
              key={i}
              className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
