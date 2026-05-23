import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Youtube, Instagram, Twitter, Github, Globe } from "lucide-react";
import { SITE } from "@/lib/constants";
import styles from "./Footer.module.css";

const FOOTER_LINKS = [
  {
    heading: "Explore",
    links: [
      { label: "Research Areas",   href: "/research" },
      { label: "Projects",         href: "/projects" },
      { label: "Articles",         href: "/articles" },
      { label: "News",             href: "/news" },
      { label: "Events",           href: "/events" },
    ],
  },
  {
    heading: "Get Involved",
    links: [
      { label: "Join Eka Research",   href: "/opportunities/join" },
      { label: "Vacancies",           href: "/opportunities/vacancy" },
      { label: "Mentoring Program",   href: "/opportunities/mentoring" },
      { label: "Member Benefits",     href: "/member-benefits" },
      { label: "Store",               href: "/store" },
    ],
  },
  {
    heading: "Organisation",
    links: [
      { label: "About Us",    href: "/about" },
      { label: "Our Team",    href: "/about#team" },
      { label: "Partners",    href: "/about#partners" },
      { label: "Contact",     href: "/contact" },
    ],
  },
];

const SOCIALS = [
  { label: "YouTube",   href: "#", icon: Youtube },
  { label: "Instagram", href: "#", icon: Instagram },
  { label: "Twitter/X", href: "#", icon: Twitter },
  { label: "GitHub",    href: "#", icon: Github },
] as const;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>

      {/* ── Main grid ── */}
      <div className={styles.inner}>
        <div className={styles.grid}>

          {/* Brand column */}
          <div className={styles.brand}>
            <Link href="/" className={styles.logoLink} aria-label={SITE.name}>
              <Image
                src="/logo.png"
                alt={`${SITE.name} logo`}
                width={36}
                height={34}
                className={styles.logoImg}
              />
              <span className={styles.logoText}>{SITE.name}</span>
            </Link>

            <p className={styles.tagline}>{SITE.tagline}</p>
            <p className={styles.desc}>{SITE.description}</p>

            <div className={styles.contact}>
              <span className={styles.contactItem}>
                <MapPin size={13} />
                <span>Headquarters: Nepal</span>
              </span>
              <span className={styles.contactItem}>
                <Globe size={13} />
                <span>International Presence: Germany | Thailand</span>
              </span>
              <a
                href={`mailto:${SITE.email}`}
                className={styles.contactItem}
              >
                <Mail size={13} />
                {SITE.email}
              </a>
            </div>

            {/* Socials */}
            <div className={styles.socials}>
              {SOCIALS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className={styles.socialIcon}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.heading} className={styles.col}>
              <h3 className={styles.colHeading}>{col.heading}</h3>
              <ul className={styles.colList}>
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={styles.colLink}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <p className={styles.copy}>
            © {year} {SITE.name}. Est. {SITE.foundedYear}, {SITE.hq}.
          </p>
        </div>
      </div>

    </footer>
  );
}
