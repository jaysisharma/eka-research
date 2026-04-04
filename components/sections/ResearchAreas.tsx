import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { RESEARCH_AREAS } from "@/lib/constants";
import { FadeUp, StaggerList, StaggerItem } from "@/components/ui/motion";
import styles from "./ResearchAreas.module.css";

export default function ResearchAreas() {
  return (
    <section className={styles.section} id="research-areas">
      <div className={styles.inner}>

        <FadeUp>
          <div className={styles.header}>
            <span className={styles.label}>
              <span className={styles.labelLine} />
              Our Research
              <span className={styles.labelLine} />
            </span>
            <h2 className={styles.heading}>
              Exploring the Universe from Nepal
            </h2>
            <p className={styles.subheading}>
              Six active disciplines spanning physics, astrophysics, mathematics,
              and space science — all open to collaboration.
            </p>
          </div>
        </FadeUp>

        <StaggerList className={styles.grid}>
          {RESEARCH_AREAS.map((area, i) => (
            <StaggerItem key={area.id}>
              <Link href={area.href} className={styles.card}>
                <div className={styles.imageWrapper}>
                  <Image
                    src={area.image}
                    alt={area.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className={styles.image}
                  />
                  <div className={styles.imageOverlay} aria-hidden="true" />
                  <div className={styles.imageAccent} aria-hidden="true" />
                  <span className={styles.index} aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.title}>{area.title}</h3>
                  <p className={styles.description}>{area.description}</p>
                  <span className={styles.cardLink}>
                    Learn more <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerList>

        <FadeUp delay={0.1}>
          <div className={styles.footer}>
            <Link href="/research" className={styles.viewAll}>
              View all research <ArrowRight size={15} />
            </Link>
          </div>
        </FadeUp>

      </div>
    </section>
  );
}
