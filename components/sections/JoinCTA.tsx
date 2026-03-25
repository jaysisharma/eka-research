import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  CalendarCheck,
  Telescope,
  GraduationCap,
  Award,
} from "lucide-react";
import { SITE } from "@/lib/constants";
import styles from "./JoinCTA.module.css";

const PERKS = [
  "Priority access to observation nights & workshops",
  "Telescope time and research instrument access",
  "Mentoring from researchers and academics",
  "Access to Eka's meteor and space weather datasets",
  "Official member certificate — recognised by partner institutions",
];

const CARD_PERKS = [
  { icon: CalendarCheck, label: "Events" },
  { icon: Telescope,     label: "Instruments" },
  { icon: GraduationCap, label: "Mentoring" },
  { icon: Award,         label: "Certificate" },
];

export default function JoinCTA() {
  return (
    <section className={styles.section} id="member-benefits">
      <div className={styles.inner}>

        {/* ── Left: Pitch ── */}
        <div className={styles.pitch}>
          <span className={styles.label}>
            <span className={styles.labelLine} />
            Join Eka Research
          </span>

          <h2 className={styles.heading}>
            Your seat at{" "}
            <span className={styles.accent}>the table.</span>
          </h2>

          <p className={styles.sub}>
            Free membership — open to everyone from Class&nbsp;9 to PhD.
            No applications, no fees, no prerequisites.
          </p>

          <ul className={styles.perks}>
            {PERKS.map((perk) => (
              <li key={perk} className={styles.perkItem}>
                <span className={styles.checkIcon} aria-hidden="true">
                  <Check size={12} strokeWidth={3} />
                </span>
                {perk}
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            <Link href="/opportunities/join" className={styles.btnPrimary}>
              Join now — it&apos;s free <ArrowRight size={16} />
            </Link>
            <Link href="/member-benefits" className={styles.btnGhost}>
              See all benefits
            </Link>
          </div>

          <p className={styles.micro}>Takes 2 minutes &nbsp;·&nbsp; No credit card</p>
        </div>

        {/* ── Right: Membership card visual ── */}
        <div className={styles.cardWrap}>

          {/* Glow behind the card */}
          <div className={styles.glow} aria-hidden="true" />

          <div className={styles.memberCard}>
            {/* Card top */}
            <div className={styles.cardTop}>
              <div className={styles.cardLogo}>
                <Image
                  src="/logo.png"
                  alt={SITE.name}
                  width={28}
                  height={28}
                  className={styles.cardLogoImg}
                />
                <span className={styles.cardOrgName}>{SITE.name}</span>
              </div>
              <span className={styles.cardBadge}>Member</span>
            </div>

            {/* Member name placeholder */}
            <div className={styles.cardName}>
              <span className={styles.cardNameLabel}>Full Name</span>
              <div className={styles.cardNameBar} />
            </div>

            <div className={styles.cardDivider} />

            {/* Perks row */}
            <div className={styles.cardPerks}>
              {CARD_PERKS.map(({ icon: Icon, label }) => (
                <div key={label} className={styles.cardPerk}>
                  <Icon size={16} strokeWidth={1.5} className={styles.cardPerkIcon} />
                  <span className={styles.cardPerkLabel}>{label}</span>
                </div>
              ))}
            </div>

            {/* Decorative orbit ring */}
            <div className={styles.cardOrbit} aria-hidden="true">
              <div className={styles.cardOrbitDot} />
            </div>

            {/* Est. year watermark */}
            <span className={styles.cardEst}>Est. {SITE.foundedYear}</span>
          </div>

          {/* Floating stats beneath card */}
          <div className={styles.floatingStats}>
            <div className={styles.floatStat}>
              <span className={styles.floatValue}>Free</span>
              <span className={styles.floatLabel}>Always</span>
            </div>
            <div className={styles.floatDivider} />
            <div className={styles.floatStat}>
              <span className={styles.floatValue}>2 min</span>
              <span className={styles.floatLabel}>To join</span>
            </div>
            <div className={styles.floatDivider} />
            <div className={styles.floatStat}>
              <span className={styles.floatValue}>Open</span>
              <span className={styles.floatLabel}>All levels</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
