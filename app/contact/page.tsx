export const dynamic = "force-dynamic";
import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, ArrowRight, Twitter, Github, ExternalLink } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/constants";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: "Contact",
  description:
    "Get in touch with Eka Research — for partnership enquiries, collaboration proposals, media requests, or general questions about our work.",
  path: "/contact",
});

const CONTACT_CHANNELS = [
  {
    icon: Mail,
    title: "Email us",
    description: "For partnerships, collaboration, membership questions, or anything else.",
    value: SITE.email,
    href: `mailto:${SITE.email}`,
    cta: "Send an email",
  },
  {
    icon: MapPin,
    title: "Find us",
    description: `Headquartered in ${SITE.hq}. International Presence: ${SITE.presence}`,
    value: `${SITE.hq} | ${SITE.presence}`,
    href: "https://maps.google.com/?q=Kathmandu,Nepal",
    cta: "Open in Maps",
  },
];

const TOPICS = [
  { label: "Research collaboration", value: "research" },
  { label: "Media & press enquiry", value: "media" },
  { label: "School / institution partnership", value: "school" },
  { label: "Membership question", value: "membership" },
  { label: "Event sponsorship", value: "sponsorship" },
  { label: "Other", value: "other" },
];

const SOCIALS = [
  { label: "Twitter / X", href: "https://twitter.com/ekaresearch", Icon: Twitter },
  { label: "GitHub", href: "https://github.com/ekaresearch", Icon: Github },
];

export default function ContactPage() {
  return (
    <main>

      {/* ── 1. Hero ── */}
      <PageHero
        label="Contact"
        title="Let&apos;s work "
        accentWord="together"
        description="Whether you're a researcher, teacher, student, journalist, or simply curious — we'd love to hear from you. Eka Research is an open organisation."
        align="left"
        variant="dark"
      />

      {/* ── 2. Two-column: channels + form ── */}
      <section className={styles.mainSection}>
        <div className={styles.mainInner}>

          {/* Left — contact info */}
          <div className={styles.infoCol}>
            <div className={styles.infoHeader}>
              <span className={styles.label}>
                <span className={styles.labelLine} />
                Get in touch
              </span>
              <h2 className={styles.infoHeading}>We read every message</h2>
              <p className={styles.infoBody}>
                Our team responds within 2 business days. For urgent research
                matters or media deadlines, flag it in the subject line and we&apos;ll
                prioritise.
              </p>
            </div>

            <div className={styles.channels}>
              {CONTACT_CHANNELS.map(({ icon: Icon, title, description, value, href, cta }) => (
                <a key={title} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className={styles.channel}>
                  <div className={styles.channelIconWrap}>
                    <Icon size={20} strokeWidth={1.75} />
                  </div>
                  <div className={styles.channelText}>
                    <span className={styles.channelTitle}>{title}</span>
                    <span className={styles.channelDesc}>{description}</span>
                    <span className={styles.channelValue}>{value}</span>
                    <span className={styles.channelCta}>
                      {cta} <ArrowRight size={12} />
                    </span>
                  </div>
                </a>
              ))}
            </div>

            {/* Socials */}
            <div className={styles.socialsBlock}>
              <span className={styles.socialsLabel}>Follow our work</span>
              <div className={styles.socialLinks}>
                {SOCIALS.map(({ label, href, Icon }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                    <Icon size={16} strokeWidth={1.75} />
                    {label}
                    <ExternalLink size={11} className={styles.socialExtIcon} />
                  </a>
                ))}
              </div>
            </div>

            {/* Location image card */}
            <div className={styles.locationCard}>
              <div className={styles.locationImgWrap}>
                <Image
                  src="https://images.unsplash.com/photo-1562679741-b2e4d3f4cbbc?auto=format&fit=crop&w=900&q=80"
                  alt="Himalayan backdrop — Eka Research home base"
                  fill
                  sizes="(max-width: 1024px) 100vw, 400px"
                  className={styles.locationImg}
                />
                <div className={styles.locationImgOverlay} />
                <div className={styles.locationBadge}>
                  <MapPin size={13} />
                  <span>
                    Headquartered in {SITE.hq}<br />
                    International Presence: {SITE.presence}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right — contact form */}
          <div className={styles.formCol}>
            <div className={styles.formCard}>
              <h3 className={styles.formHeading}>Send us a message</h3>
              <p className={styles.formSub}>All fields marked * are required.</p>

              <form className={styles.form} action="mailto:hello@ekaresearch.org" method="post" encType="text/plain">

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name" className={styles.formLabel}>Full name *</label>
                    <input id="name" name="name" type="text" required className={styles.formInput} placeholder="Your name" />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.formLabel}>Email address *</label>
                    <input id="email" name="email" type="email" required className={styles.formInput} placeholder="you@example.com" />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="topic" className={styles.formLabel}>Topic *</label>
                  <select id="topic" name="topic" required className={styles.formSelect}>
                    <option value="">Select a topic…</option>
                    {TOPICS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="org" className={styles.formLabel}>Organisation / institution</label>
                  <input id="org" name="org" type="text" className={styles.formInput} placeholder="University, school, company…" />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message" className={styles.formLabel}>Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    className={styles.formTextarea}
                    placeholder="Tell us what you're working on, what you need, or what you'd like to discuss…"
                  />
                </div>

                <button type="submit" className={styles.submitBtn}>
                  Send message <ArrowRight size={15} />
                </button>

                <p className={styles.formNote}>
                  We typically reply within 2 business days. Your message is sent directly to our team — no third-party forms.
                </p>
              </form>
            </div>
          </div>

        </div>
      </section>

      {/* ── 3. Partner teaser ── */}
      <section className={styles.partnerSection}>
        <div className={styles.partnerInner}>
          <div className={styles.partnerImgWrap}>
            <Image
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80"
              alt="Stars over the Himalayas — Eka Research field site"
              fill
              sizes="100vw"
              className={styles.partnerImg}
            />
            <div className={styles.partnerImgOverlay} />
          </div>
          <div className={styles.partnerContent}>
            <span className={styles.label} style={{ color: "rgba(255,255,255,0.7)" }}>
              <span className={styles.labelLineWhite} />
              Partnerships
            </span>
            <h2 className={styles.partnerHeading}>
              Open science starts with{" "}
              <span className={styles.partnerAccent}>open partnerships</span>
            </h2>
            <p className={styles.partnerBody}>
              We collaborate with universities, NGOs, government agencies, and private institutions.
              If you share our commitment to accessible science, we want to talk.
            </p>
            <div className={styles.partnerActions}>
              <Link href={`mailto:${SITE.email}`} className={styles.partnerBtn}>
                Start a conversation <ArrowRight size={14} />
              </Link>
              <Link href="/about#partners" className={styles.partnerLink}>
                Our current partners
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
