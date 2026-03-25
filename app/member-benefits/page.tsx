import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  CalendarCheck,
  Telescope,
  GraduationCap,
  Database,
  Network,
  Award,
} from "lucide-react";
import { SITE } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: "Member Benefits",
  description:
    "Free membership for everyone — from Class 9 students to PhD researchers. Unlock events, telescope time, mentoring, research data, and more.",
  path: "/member-benefits",
});

const STEPS = [
  {
    n: "01",
    title: "Fill in the form",
    body: "Name, email, and your level — that's all. Takes two minutes. No documents, no approval queue.",
  },
  {
    n: "02",
    title: "Get your welcome email",
    body: "Your member ID, digital certificate, and a complete guide to everything you now have access to.",
  },
  {
    n: "03",
    title: "Start right away",
    body: "Register for events, request instrument time, or book a mentoring session — your membership is live immediately.",
  },
];

const FAQ = [
  { q: "Is membership really free — forever?", a: "Yes, always. Eka Research is committed to keeping individual membership free. No subscriptions, no paywalls." },
  { q: "Who can join?", a: "Anyone — from Class 9 students to PhD researchers and working professionals. No qualifications or prior experience required." },
  { q: "Do I need to be based in Nepal?", a: "No. Nepali diaspora, international students, and global collaborators interested in South Asian space science are all welcome." },
  { q: "Is there a time commitment?", a: "None whatsoever. Participate as much or as little as you like. There are no mandatory activities or dues." },
  { q: "Can my school join as a group?", a: "Yes — email hello@ekaresearch.org for institutional and group memberships, which come with extra classroom resources and support." },
];

export default function MemberBenefitsPage() {
  return (
    <main>

      {/* ═══════════════════════════════════════════
          1. HERO — split: pitch left, card right
      ═══════════════════════════════════════════ */}
      <section className={styles.hero}>
        <div className={styles.heroGlowLeft}  aria-hidden="true" />
        <div className={styles.heroGlowRight} aria-hidden="true" />

        <div className={styles.heroInner}>
          {/* Left */}
          <div className={styles.heroPitch}>
            <span className={styles.heroLabel}>
              <span className={styles.labelLine} />
              Member Benefits
            </span>

            <h1 className={styles.heroHeading}>
              Everything that comes with your{" "}
              <span className={styles.heroAccent}>free membership</span>
            </h1>

            <p className={styles.heroSub}>
              Open to everyone — Class&nbsp;9 students to PhD researchers.
              No fees, no applications, no prerequisites.
            </p>

            <ul className={styles.heroChecks}>
              {[
                "Priority access to events & observation nights",
                "Telescope and instrument booking",
                "1-on-1 mentoring from researchers",
                "Full research dataset access",
                "Official member certificate",
              ].map((item) => (
                <li key={item} className={styles.heroCheck}>
                  <span className={styles.checkBubble}><Check size={11} strokeWidth={3} /></span>
                  {item}
                </li>
              ))}
            </ul>

            <div className={styles.heroActions}>
              <Link href="/opportunities/join" className={styles.btnPrimary}>
                Join now — it&apos;s free <ArrowRight size={16} />
              </Link>
              <p className={styles.heroMicro}>2 minutes · No credit card</p>
            </div>
          </div>

          {/* Right — membership card */}
          <div className={styles.heroCardWrap}>
            <div className={styles.heroCardGlow} aria-hidden="true" />
            <div className={styles.memberCard}>
              <div className={styles.mcTop}>
                <div className={styles.mcLogo}>
                  <Image src="/logo.png" alt={SITE.name} width={24} height={24} className={styles.mcLogoImg} />
                  <span className={styles.mcOrgName}>{SITE.name}</span>
                </div>
                <span className={styles.mcBadge}>Member</span>
              </div>

              <div className={styles.mcName}>
                <span className={styles.mcNameLabel}>Full Name</span>
                <div className={styles.mcNameBar} />
              </div>

              <div className={styles.mcDivider} />

              <div className={styles.mcIcons}>
                {[
                  { Icon: CalendarCheck, label: "Events" },
                  { Icon: Telescope,     label: "Instruments" },
                  { Icon: GraduationCap, label: "Mentoring" },
                  { Icon: Award,         label: "Certificate" },
                ].map(({ Icon, label }) => (
                  <div key={label} className={styles.mcIcon}>
                    <Icon size={16} strokeWidth={1.5} className={styles.mcIconSvg} />
                    <span className={styles.mcIconLabel}>{label}</span>
                  </div>
                ))}
              </div>

              <div className={styles.mcOrbit} aria-hidden="true">
                <div className={styles.mcOrbitDot} />
              </div>
              <span className={styles.mcEst}>Est. {SITE.foundedYear}</span>
            </div>

            {/* Floating pill */}
            <div className={styles.heroPill}>
              <span className={styles.pillDot} />
              Free · Always
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          2. BENTO BENEFITS GRID
      ═══════════════════════════════════════════ */}
      <section className={styles.bentoSection}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.label}>
              <span className={styles.labelLine} />
              What you unlock
            </span>
            <h2 className={styles.sectionHeading}>Six things that open up the moment you join</h2>
          </div>

          <div className={styles.bento}>

            {/* Cell 1 — Events (large, with image) */}
            <div className={`${styles.bentoCell} ${styles.bentoCellLarge}`}>
              <div className={styles.bentoBg}>
                <Image
                  src="https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1200&q=80"
                  alt="Meteor shower observation night"
                  fill
                  className={styles.bentoBgImg}
                  sizes="(max-width: 1024px) 100vw, 55vw"
                />
                <div className={styles.bentoBgOverlay} />
              </div>
              <div className={styles.bentoCellContent}>
                <div className={styles.bentoIconWrap}><CalendarCheck size={20} strokeWidth={1.75} /></div>
                <h3 className={styles.bentoCellTitle}>Priority Event Access</h3>
                <p className={styles.bentoCellDesc}>Register before the public for observation nights, meteor watches, workshops, and field trips — seats go fast.</p>
              </div>
            </div>

            {/* Cell 2 — Telescope */}
            <div className={`${styles.bentoCell} ${styles.bentoCellSmall}`}>
              <div className={styles.bentoCellContent}>
                <div className={styles.bentoIconWrap}><Telescope size={20} strokeWidth={1.75} /></div>
                <h3 className={styles.bentoCellTitle}>Telescope & Instrument Time</h3>
                <p className={styles.bentoCellDesc}>Book dedicated slots on Eka's All Sky Camera, weather station, and telescopes.</p>
                <ul className={styles.bentoList}>
                  <li>All Sky Camera network</li>
                  <li>Weather station data</li>
                  <li>Remote observation support</li>
                </ul>
              </div>
            </div>

            {/* Cell 3 — Data (wide) */}
            <div className={`${styles.bentoCell} ${styles.bentoCellWide}`}>
              <div className={styles.bentoCellContent}>
                <div className={styles.bentoIconWrap}><Database size={20} strokeWidth={1.75} /></div>
                <h3 className={styles.bentoCellTitle}>Research Data Access</h3>
                <p className={styles.bentoCellDesc}>Full access to Eka's cleaned, documented datasets — ready for your own research or coursework.</p>
                <div className={styles.bentaTags}>
                  {["Meteor events", "Space weather", "Atmospheric data", "API access"].map(t => (
                    <span key={t} className={styles.bentoTag}>{t}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Cell 4 — Mentoring */}
            <div className={`${styles.bentoCell} ${styles.bentoCellSmall}`}>
              <div className={styles.bentoCellContent}>
                <div className={styles.bentoIconWrap}><GraduationCap size={20} strokeWidth={1.75} /></div>
                <h3 className={styles.bentoCellTitle}>Mentoring Program</h3>
                <p className={styles.bentoCellDesc}>Get matched with a researcher or academic for 1-on-1 guidance on projects, papers, and careers.</p>
              </div>
            </div>

            {/* Cell 5 — Network */}
            <div className={`${styles.bentoCell} ${styles.bentoCellSmall}`}>
              <div className={styles.bentoCellContent}>
                <div className={styles.bentoIconWrap}><Network size={20} strokeWidth={1.75} /></div>
                <h3 className={styles.bentoCellTitle}>Researcher Network</h3>
                <p className={styles.bentoCellDesc}>Connect with Nepali scientists and international collaborators working in space science.</p>
              </div>
            </div>

            {/* Cell 6 — Certificate (accent) */}
            <div className={`${styles.bentoCell} ${styles.bentoCellAccent}`}>
              <div className={styles.bentoCellContent}>
                <div className={styles.bentoIconWrap}><Award size={20} strokeWidth={1.75} /></div>
                <h3 className={styles.bentoCellTitle}>Member Certificate</h3>
                <p className={styles.bentoCellDesc}>Official Eka Research certificate — recognised by partner universities and institutions across Nepal.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          3. HOW TO JOIN — large numbered steps
      ═══════════════════════════════════════════ */}
      <section className={`${styles.stepsSection}`} id="how-to-join">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.label}>
              <span className={styles.labelLine} />
              How to join
            </span>
            <h2 className={styles.sectionHeading}>Three steps. Two minutes.</h2>
          </div>

          <div className={styles.steps}>
            {STEPS.map((step, i) => (
              <div key={step.n} className={`${styles.step} ${i % 2 === 1 ? styles.stepReverse : ""}`}>
                <div className={styles.stepLeft}>
                  <span className={styles.stepN}>{step.n}</span>
                </div>
                <div className={styles.stepRight}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepBody}>{step.body}</p>
                </div>
                {i < STEPS.length - 1 && <div className={styles.stepRule} aria-hidden="true" />}
              </div>
            ))}
          </div>

          <div className={styles.stepsAction}>
            <Link href="/opportunities/join" className={styles.btnPrimary}>
              Join Eka Research — free <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          4. FAQ + STICKY CTA — side by side
      ═══════════════════════════════════════════ */}
      <section className={`${styles.faqSection}`}>
        <div className={styles.sectionInner}>
          <div className={styles.faqGrid}>

            {/* Left — FAQ */}
            <div className={styles.faqCol}>
              <span className={styles.label}>
                <span className={styles.labelLine} />
                FAQ
              </span>
              <h2 className={styles.faqHeading}>Common questions</h2>

              <div className={styles.faqList}>
                {FAQ.map(({ q, a }) => (
                  <details key={q} className={styles.faqItem}>
                    <summary className={styles.faqQ}>
                      {q}
                      <span className={styles.faqIcon} aria-hidden="true" />
                    </summary>
                    <p className={styles.faqA}>{a}</p>
                  </details>
                ))}
              </div>
            </div>

            {/* Right — sticky join card */}
            <div className={styles.ctaCol}>
              <div className={styles.ctaCard}>
                <div className={styles.ctaCardGlow} aria-hidden="true" />
                <span className={styles.ctaCardTag}>Free · Always</span>
                <h3 className={styles.ctaCardHeading}>Ready to join?</h3>
                <p className={styles.ctaCardSub}>
                  Your membership starts the moment you sign up. No waiting, no approval.
                </p>
                <Link href="/opportunities/join" className={styles.ctaCardBtn}>
                  Join now <ArrowRight size={15} />
                </Link>
                <div className={styles.ctaCardStats}>
                  {[["2 min", "To join"], ["Free", "Always"], ["Open", "All levels"]].map(([val, lbl]) => (
                    <div key={lbl} className={styles.ctaStat}>
                      <span className={styles.ctaStatVal}>{val}</span>
                      <span className={styles.ctaStatLbl}>{lbl}</span>
                    </div>
                  ))}
                </div>
                <p className={styles.ctaCardNote}>
                  Questions?{" "}
                  <a href="mailto:hello@ekaresearch.org" className={styles.ctaCardEmail}>
                    hello@ekaresearch.org
                  </a>
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}
