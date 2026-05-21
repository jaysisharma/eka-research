export const dynamic = "force-dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  Mail,
  MapPin,
  ArrowRight,
  Github,
  Clock,
  Globe,
} from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/constants";
import ContactForm from "./ContactForm";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: "Contact",
  description:
    "Get in touch with Eka Research — for partnership enquiries, collaboration proposals, media requests, or general questions about our work.",
  path: "/contact",
});

const MISSION_STATS = [
  { icon: Clock, label: "Response time", value: "≤ 2 business days" },
  { icon: Globe, label: "Timezone", value: "NPT (UTC +5:45)" },
  { icon: MapPin, label: "Bases", value: "Nepal · Germany · Thailand" },
];

const CHANNELS = [
  {
    icon: Mail,
    label: "Email",
    value: SITE.email,
    href: `mailto:${SITE.email}`,
    meta: "Primary contact",
  },
  {
    icon: MapPin,
    label: "Location",
    value: `${SITE.hq} · ${SITE.presence}`,
    href: "https://maps.google.com/?q=Kathmandu,Nepal",
    meta: "Open in Maps",
  },
  {
    icon: Github,
    label: "Follow",
    value: "@ekaresearch",
    href: "https://github.com/ekaresearch",
    meta: "GitHub",
  },
];

export default function ContactPage() {
  return (
    <main>
      {/* ── 1. Hero ── */}
      <section className={styles.hero}>
        <div className={styles.glowA} aria-hidden="true" />
        <div className={styles.glowB} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowLine} />
              Contact
            </span>
            <h1 className={styles.heroTitle}>
              Let&apos;s work
              <br />
              <span className={styles.heroAccent}>together</span>
            </h1>
            <p className={styles.heroDesc}>
              Whether you&apos;re a researcher, teacher, student, journalist,
              or simply curious — we&apos;d love to hear from you. Eka Research
              is an open organisation.
            </p>
          </div>
          <div className={styles.heroRight}>
            <div className={styles.statsPanel}>
              <div className={styles.statsPanelHead}>
                <span className={styles.statsPanelLabel}>Mission status</span>
                <span className={styles.activeDot} aria-hidden="true" />
              </div>
              {MISSION_STATS.map(({ icon: Icon, label, value }) => (
                <div key={label} className={styles.stat}>
                  <div className={styles.statIcon}>
                    <Icon size={14} strokeWidth={1.75} />
                  </div>
                  <div className={styles.statText}>
                    <span className={styles.statLabel}>{label}</span>
                    <span className={styles.statValue}>{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Channels bar ── */}
      <div className={styles.channelsBar}>
        <div className={styles.channelsInner}>
          {CHANNELS.map(({ icon: Icon, label, value, href, meta }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className={styles.channel}
            >
              <div className={styles.channelTop}>
                <div className={styles.channelIcon}>
                  <Icon size={16} strokeWidth={1.75} />
                </div>
                <span className={styles.channelLabel}>{label}</span>
              </div>
              <span className={styles.channelValue}>{value}</span>
              <span className={styles.channelMeta}>
                {meta}
                <ArrowRight size={11} className={styles.channelArrow} />
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* ── 3. Form ── */}
      <section className={styles.formSection}>
        <div className={styles.formInner}>
          <div className={styles.formHead}>
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowLine} />
              Get in touch
            </span>
            <h2 className={styles.formTitle}>Send us a message</h2>
            <p className={styles.formSubtitle}>
              We read every message. Flag urgent matters in the subject line and
              we&apos;ll prioritise.
            </p>
          </div>

          <ContactForm />
        </div>
      </section>

      {/* ── 4. Partnerships CTA ── */}
      <section className={styles.cta}>
        <div className={styles.ctaImgWrap} aria-hidden="true">
          <Image
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80"
            alt="Stars over the Himalayas — Eka Research field site"
            fill
            sizes="100vw"
            className={styles.ctaImg}
          />
          <div className={styles.ctaOverlay} />
        </div>
        <div className={styles.ctaContent}>
          <span className={styles.ctaEyebrow}>
            <span className={styles.ctaLine} />
            Partnerships
          </span>
          <h2 className={styles.ctaHeading}>
            Open science starts with{" "}
            <span className={styles.ctaAccent}>open partnerships</span>
          </h2>
          <p className={styles.ctaBody}>
            We collaborate with universities, NGOs, government agencies, and
            private institutions. If you share our commitment to accessible
            science, we want to talk.
          </p>
          <div className={styles.ctaActions}>
            <Link href={`mailto:${SITE.email}`} className={styles.ctaBtn}>
              Start a conversation <ArrowRight size={14} />
            </Link>
            <Link href="/about#partners" className={styles.ctaSecondary}>
              See our partners
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
