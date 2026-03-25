import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PROJECTS } from "@/lib/constants";
import styles from "./FeaturedProjects.module.css";

const STATUS_LABEL: Record<string, string> = {
  ongoing:   "Ongoing",
  completed: "Completed",
  upcoming:  "Upcoming",
};

export default function FeaturedProjects() {
  const featured = PROJECTS.find((p) => p.featured)!;
  const rest     = PROJECTS.filter((p) => !p.featured);

  return (
    <section className={styles.section} id="projects">
      <div className={styles.inner}>

        {/* Header */}
        <div className={styles.header}>
          <span className={styles.label}>
            <span className={styles.labelLine} />
            Featured Projects
            <span className={styles.labelLine} />
          </span>
          <div className={styles.headerRow}>
            <h2 className={styles.heading}>What we're working on</h2>
            <Link href="/projects" className={styles.viewAll}>
              All projects <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Grid: 1 large + 2 stacked */}
        <div className={styles.grid}>

          {/* Featured card — large */}
          <Link href={featured.href} className={`${styles.card} ${styles.cardFeatured}`}>
            <div className={styles.imageWrapper}>
              <Image
                src={featured.image}
                alt={featured.title}
                fill
                sizes="(max-width: 1024px) 100vw, 58vw"
                className={styles.image}
                priority
              />
              <div className={styles.imageOverlay} aria-hidden="true" />
              <span className={`${styles.badge} ${styles[`badge_${featured.status}`]}`}>
                <span className={styles.badgeDot} aria-hidden="true" />
                {STATUS_LABEL[featured.status]}
              </span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.meta}>
                <span className={styles.period}>{featured.period}</span>
                <div className={styles.tags}>
                  {featured.tags.map((t) => (
                    <span key={t} className={styles.tag}>{t}</span>
                  ))}
                </div>
              </div>
              <h3 className={styles.title}>{featured.title}</h3>
              <p className={styles.description}>{featured.description}</p>
              <span className={styles.cardLink}>
                View project <ArrowUpRight size={14} />
              </span>
            </div>
          </Link>

          {/* Side stack */}
          <div className={styles.stack}>
            {rest.map((project) => (
              <Link key={project.id} href={project.href} className={`${styles.card} ${styles.cardSmall}`}>
                <div className={styles.imageWrapperSmall}>
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className={styles.image}
                  />
                  <div className={styles.imageOverlay} aria-hidden="true" />
                  <span className={`${styles.badge} ${styles[`badge_${project.status}`]}`}>
                    <span className={styles.badgeDot} aria-hidden="true" />
                    {STATUS_LABEL[project.status]}
                  </span>
                </div>
                <div className={styles.cardBodySmall}>
                  <div className={styles.meta}>
                    <span className={styles.period}>{project.period}</span>
                    <div className={styles.tags}>
                      {project.tags.slice(0, 2).map((t) => (
                        <span key={t} className={styles.tag}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <h3 className={styles.titleSmall}>{project.title}</h3>
                  <p className={styles.descriptionSmall}>{project.description}</p>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
