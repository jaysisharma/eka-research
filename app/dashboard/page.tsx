import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Calendar, ShoppingBag, BookOpen,
  ArrowRight, Award, Star, Telescope, FileText,
  CheckCircle2, Clock, Send,
} from "lucide-react";
import { ROLE_LABELS } from "@/lib/access";
import type { UserRole } from "@/lib/access";
import styles from "./page.module.css";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const SUBMISSION_STATUS_LABEL: Record<string, string> = {
  pending:  "Under Review",
  approved: "Published",
  rejected: "Rejected",
};

const VACANCY_TYPE_LABEL: Record<string, string> = {
  FULL_TIME:  "Full-time",
  PART_TIME:  "Part-time",
  INTERNSHIP: "Internship",
  VOLUNTEER:  "Volunteer",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const { id: userId, email, name, role } = session.user as {
    id: string; email: string; name: string; role: string;
  };

  /* ── fetch data ─────────────────────────────────────────── */
  const [registeredEvents, recentOrders, myPapers] = await Promise.all([
    db.eventRegistration.findMany({
      where: { userId },
      include: { event: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    db.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    (role === "RESEARCHER" || role === "PAID_MEMBER" || role === "ADMIN")
      ? db.researchArticle.findMany({
          where: { submittedBy: userId },
          orderBy: { createdAt: "desc" },
          take: 3,
          select: {
            id: true, title: true, type: true,
            publicationStatus: true, submissionStatus: true,
            createdAt: true,
          },
        })
      : Promise.resolve([]),
  ]);

  /* researcher stats */
  let paperStats = { total: 0, pending: 0, published: 0 };
  if (role === "RESEARCHER" || role === "ADMIN") {
    const [total, pending, published] = await Promise.all([
      db.researchArticle.count({ where: { submittedBy: userId } }),
      db.researchArticle.count({ where: { submittedBy: userId, submissionStatus: "pending" } }),
      db.researchArticle.count({ where: { submittedBy: userId, submissionStatus: "approved" } }),
    ]);
    paperStats = { total, pending, published };
  }

  const roleLabel = ROLE_LABELS[role as UserRole] ?? role;
  const firstName = name?.split(" ")[0] ?? "there";

  return (
    <div className={styles.page}>

      {/* ── PAGE HEADER ───────────────────────────────────── */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.heading}>Welcome back, {firstName}</h1>
          <p className={styles.sub}>
            <span className={styles.roleBadge}>{roleLabel}</span>
            {email}
          </p>
        </div>
      </header>

      {/* ── FREE USER: upgrade banner ─────────────────────── */}
      {role === "FREE_USER" && (
        <div className={styles.upgradeBanner}>
          <div className={styles.upgradeBannerLeft}>
            <Award size={20} className={styles.goldIcon} />
            <div>
              <p className={styles.upgradeBannerTitle}>Unlock Premium Access</p>
              <p className={styles.upgradeBannerDesc}>
                Get access to research papers, member benefits, and exclusive
                Eka events by upgrading your membership.
              </p>
            </div>
          </div>
          <Link href="/upgrade" className={styles.upgradeBtn}>
            Upgrade Now <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* ── RESEARCHER: stats row ─────────────────────────── */}
      {role === "RESEARCHER" && (
        <section className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total Papers</span>
            <strong className={styles.statValue}>{paperStats.total}</strong>
          </div>
          <div className={styles.statCard}>
            <Clock size={16} className={styles.statIcon} />
            <span className={styles.statLabel}>Under Review</span>
            <strong className={styles.statValue}>{paperStats.pending}</strong>
          </div>
          <div className={styles.statCard}>
            <CheckCircle2 size={16} className={styles.statIconSuccess} />
            <span className={styles.statLabel}>Published</span>
            <strong className={styles.statValue}>{paperStats.published}</strong>
          </div>
          <div className={styles.statCard}>
            <Telescope size={16} className={styles.statIcon} />
            <span className={styles.statLabel}>Role</span>
            <strong className={styles.statValue} style={{ fontSize: "var(--text-sm)", letterSpacing: 0 }}>Researcher</strong>
          </div>
        </section>
      )}

      {/* ── PAID_MEMBER: benefits card ────────────────────── */}
      {role === "PAID_MEMBER" && (
        <div className={styles.benefitsCard}>
          <div className={styles.benefitsLeft}>
            <Star size={18} className={styles.goldIcon} />
            <div>
              <p className={styles.benefitsTitle}>Premium Member</p>
              <p className={styles.benefitsDesc}>
                You have full access to research papers, exclusive downloads,
                and priority event registration.
              </p>
            </div>
          </div>
          <Link href="/research" className={styles.benefitsLink}>
            Browse Papers <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* ── CONTENT GRID ─────────────────────────────────── */}
      <div className={styles.grid}>

        {/* ── LEFT COL ── */}
        <div className={styles.leftCol}>

          {/* Researcher: recent papers */}
          {(role === "RESEARCHER" || role === "PAID_MEMBER") && (
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <BookOpen size={16} /> My Research Papers
                </h2>
                <Link href="/dashboard/research" className={styles.cardLink}>
                  View All <ArrowRight size={13} />
                </Link>
              </div>

              {myPapers.length === 0 ? (
                <div className={styles.emptyState}>
                  <FileText size={28} strokeWidth={1.25} />
                  <p>No papers submitted yet.</p>
                  <Link href="/dashboard/research" className={styles.emptyAction}>
                    Submit your first paper
                  </Link>
                </div>
              ) : (
                <ul className={styles.paperList}>
                  {myPapers.map((p) => (
                    <li key={p.id} className={styles.paperItem}>
                      <div className={styles.paperMeta}>
                        <span className={styles.paperTypeBadge}>{p.type}</span>
                        <span className={
                          p.submissionStatus === "approved"
                            ? styles.statusApproved
                            : p.submissionStatus === "pending"
                            ? styles.statusPending
                            : styles.statusRejected
                        }>
                          {SUBMISSION_STATUS_LABEL[p.submissionStatus] ?? p.submissionStatus}
                        </span>
                      </div>
                      <p className={styles.paperTitle}>{p.title}</p>
                      <p className={styles.paperDate}>{formatDate(p.createdAt)}</p>
                    </li>
                  ))}
                </ul>
              )}

              {role === "RESEARCHER" && (
                <Link href="/dashboard/research" className={styles.submitAction}>
                  <Send size={14} /> Submit New Paper
                </Link>
              )}
            </section>
          )}

          {/* Registered events */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <Calendar size={16} /> Upcoming Events
              </h2>
              <Link href="/dashboard/events" className={styles.cardLink}>
                View All <ArrowRight size={13} />
              </Link>
            </div>

            {registeredEvents.length === 0 ? (
              <div className={styles.emptyState}>
                <Calendar size={28} strokeWidth={1.25} />
                <p>No registered events yet.</p>
                <Link href="/events" className={styles.emptyAction}>
                  Browse events
                </Link>
              </div>
            ) : (
              <ul className={styles.eventList}>
                {registeredEvents.map((reg) => (
                  <li key={reg.id} className={styles.eventItem}>
                    <div className={styles.eventDot} />
                    <div className={styles.eventBody}>
                      <p className={styles.eventName}>{reg.event.title}</p>
                      <p className={styles.eventMeta}>
                        <span>{reg.event.date}</span>
                        <span>·</span>
                        <span>{reg.event.location}</span>
                      </p>
                    </div>
                    <span className={styles.eventTypeBadge}>{reg.event.type}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* ── RIGHT COL ── */}
        <aside className={styles.rightCol}>

          {/* Recent orders */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <ShoppingBag size={16} /> Recent Orders
              </h2>
              <Link href="/dashboard/orders" className={styles.cardLink}>
                View All <ArrowRight size={13} />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className={styles.emptyState}>
                <ShoppingBag size={28} strokeWidth={1.25} />
                <p>No orders placed yet.</p>
                <Link href="/store" className={styles.emptyAction}>Visit the store</Link>
              </div>
            ) : (
              <ul className={styles.orderList}>
                {recentOrders.map((order) => (
                  <li key={order.id} className={styles.orderItem}>
                    <div>
                      <p className={styles.orderId}>
                        #{order.id.slice(-8).toUpperCase()}
                      </p>
                      <p className={styles.orderDate}>{formatDate(order.createdAt)}</p>
                    </div>
                    <div className={styles.orderRight}>
                      <span className={`${styles.orderStatus} ${styles[`os_${order.status}`]}`}>
                        {order.status}
                      </span>
                      <span className={styles.orderTotal}>
                        NPR {order.totalNpr.toLocaleString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Quick links */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Quick Links</h2>
            </div>
            <div className={styles.quickLinks}>
              <Link href="/events" className={styles.quickLink}>
                <Calendar size={15} /> Browse Events
              </Link>
              <Link href="/research" className={styles.quickLink}>
                <BookOpen size={15} /> Research Papers
              </Link>
              <Link href="/opportunities/vacancy" className={styles.quickLink}>
                <FileText size={15} /> Job Openings
              </Link>
              <Link href="/store" className={styles.quickLink}>
                <ShoppingBag size={15} /> Store
              </Link>
              {role === "FREE_USER" && (
                <Link href="/upgrade" className={styles.quickLinkGold}>
                  <Award size={15} /> Upgrade Membership
                </Link>
              )}
            </div>
          </section>

        </aside>
      </div>
    </div>
  );
}
