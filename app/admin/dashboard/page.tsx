import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Users, BookOpen, Calendar, MessageSquare,
  ArrowRight, Briefcase, GraduationCap,
  ShoppingBag, Newspaper, Clock,
} from "lucide-react";
import styles from "./page.module.css";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

const ROLE_COLOR: Record<string, string> = {
  ADMIN:       "gold",
  RESEARCHER:  "blue",
  PAID_MEMBER: "purple",
  TEACHER:     "green",
  MENTOR:      "teal",
  FREE_USER:   "default",
};

const ROLE_LABEL: Record<string, string> = {
  ADMIN:       "Admin",
  RESEARCHER:  "Researcher",
  PAID_MEMBER: "Pro Member",
  TEACHER:     "Teacher",
  MENTOR:      "Mentor",
  FREE_USER:   "Free",
};

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login");

  const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

  /* ── Real data from DB ────────────────────────────────────────────── */
  const [
    totalUsers,
    pendingPapers,
    upcomingEvents,
    unreadMessages,
    unreadVacancyApps,
    unreadMentoringApps,
    pendingOrders,
    recentUsers,
    recentOrders,
  ] = await Promise.all([
    db.user.count(),
    db.researchArticle.count({ where: { submissionStatus: "pending" } }),
    db.event.count({ where: { published: true, date: { gte: today } } }),
    db.contactMessage.count({ where: { read: false } }),
    db.vacancyApplication.count({ where: { read: false } }),
    db.mentoringApplication.count({ where: { read: false } }),
    db.order.count({ where: { status: "pending" } }),

    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, totalNpr: true, status: true, createdAt: true },
    }),
  ]);

  const totalAlerts = pendingPapers + unreadMessages + unreadVacancyApps + unreadMentoringApps + pendingOrders;

  const STATS = [
    { label: "Total Users",       value: totalUsers,      icon: Users,        href: "/admin/users"   },
    { label: "Pending Papers",    value: pendingPapers,   icon: BookOpen,     href: "/admin/papers"  },
    { label: "Upcoming Events",   value: upcomingEvents,  icon: Calendar,     href: "/admin/events"  },
    { label: "Unread Messages",   value: unreadMessages,  icon: MessageSquare,href: "/admin/messages"},
  ];

  return (
    <div className={styles.page}>

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageSubtitle}>
            Welcome back, <strong>{session.user.name}</strong>.
            {totalAlerts > 0 && (
              <span className={styles.alertPill}>{totalAlerts} item{totalAlerts !== 1 ? "s" : ""} need attention</span>
            )}
          </p>
        </div>
        <Link href="/" className={styles.viewSiteBtn} target="_blank">
          View Site <ArrowRight size={13} />
        </Link>
      </header>

      {/* ── STATS ROW ──────────────────────────────────────────── */}
      <section className={styles.statsGrid}>
        {STATS.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className={styles.statCard}>
            <div className={styles.statTop}>
              <span className={styles.statLabel}>{label}</span>
              <span className={styles.statIconWrap}><Icon size={15} /></span>
            </div>
            <strong className={styles.statValue}>{value}</strong>
          </Link>
        ))}
      </section>

      {/* ── MAIN GRID ──────────────────────────────────────────── */}
      <div className={styles.mainGrid}>

        {/* LEFT COLUMN */}
        <div className={styles.leftCol}>

          {/* NEEDS ATTENTION */}
          {totalAlerts > 0 && (
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <Clock size={15} /> Needs Attention
                </h2>
              </div>
              <div className={styles.attentionList}>
                {pendingPapers > 0 && (
                  <Link href="/admin/papers" className={styles.attentionItem}>
                    <span className={styles.attentionDot} data-color="gold" />
                    <span className={styles.attentionText}>
                      <strong>{pendingPapers}</strong> research paper{pendingPapers !== 1 ? "s" : ""} awaiting review
                    </span>
                    <ArrowRight size={13} className={styles.attentionArrow} />
                  </Link>
                )}
                {unreadMessages > 0 && (
                  <Link href="/admin/messages" className={styles.attentionItem}>
                    <span className={styles.attentionDot} data-color="blue" />
                    <span className={styles.attentionText}>
                      <strong>{unreadMessages}</strong> unread contact message{unreadMessages !== 1 ? "s" : ""}
                    </span>
                    <ArrowRight size={13} className={styles.attentionArrow} />
                  </Link>
                )}
                {unreadVacancyApps > 0 && (
                  <Link href="/admin/opportunities/applications" className={styles.attentionItem}>
                    <span className={styles.attentionDot} data-color="purple" />
                    <span className={styles.attentionText}>
                      <strong>{unreadVacancyApps}</strong> new vacancy application{unreadVacancyApps !== 1 ? "s" : ""}
                    </span>
                    <ArrowRight size={13} className={styles.attentionArrow} />
                  </Link>
                )}
                {unreadMentoringApps > 0 && (
                  <Link href="/admin/opportunities/mentoring" className={styles.attentionItem}>
                    <span className={styles.attentionDot} data-color="teal" />
                    <span className={styles.attentionText}>
                      <strong>{unreadMentoringApps}</strong> new mentoring application{unreadMentoringApps !== 1 ? "s" : ""}
                    </span>
                    <ArrowRight size={13} className={styles.attentionArrow} />
                  </Link>
                )}
                {pendingOrders > 0 && (
                  <Link href="/admin/store/orders" className={styles.attentionItem}>
                    <span className={styles.attentionDot} data-color="green" />
                    <span className={styles.attentionText}>
                      <strong>{pendingOrders}</strong> pending store order{pendingOrders !== 1 ? "s" : ""}
                    </span>
                    <ArrowRight size={13} className={styles.attentionArrow} />
                  </Link>
                )}
              </div>
            </section>
          )}

          {/* RECENT USERS */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}><Users size={15} /> Recent Sign-ups</h2>
              <Link href="/admin/users" className={styles.cardLink}>
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {recentUsers.length === 0 ? (
              <p className={styles.empty}>No users yet.</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((u: any) => (
                    <tr key={u.id}>
                      <td className={styles.tdName}>{u.name}</td>
                      <td className={styles.tdMuted}>{u.email}</td>
                      <td>
                        <span
                          className={styles.roleBadge}
                          data-color={ROLE_COLOR[u.role] ?? "default"}
                        >
                          {ROLE_LABEL[u.role] ?? u.role}
                        </span>
                      </td>
                      <td className={styles.tdMuted}>{formatDate(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* RECENT ORDERS */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}><ShoppingBag size={15} /> Recent Orders</h2>
              <Link href="/admin/store/orders" className={styles.cardLink}>
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className={styles.empty}>No orders yet.</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o: any) => (
                    <tr key={o.id}>
                      <td className={styles.tdMono}>#{o.id.slice(-7).toUpperCase()}</td>
                      <td className={styles.tdName}>{o.name}</td>
                      <td className={styles.tdMuted}>NPR {o.totalNpr.toLocaleString()}</td>
                      <td>
                        <span className={styles.orderStatus} data-status={o.status}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

        </div>

        {/* RIGHT COLUMN — quick actions */}
        <div className={styles.rightCol}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Quick Actions</h2>
            </div>
            <nav className={styles.quickLinks}>
              <Link href="/admin/users"                         className={styles.quickLink}><Users size={15} />          Manage Users</Link>
              <Link href="/admin/papers"                        className={styles.quickLink}><BookOpen size={15} />       Review Papers</Link>
              <Link href="/admin/news/new"                      className={styles.quickLink}><Newspaper size={15} />      Add News Post</Link>
              <Link href="/admin/events"                        className={styles.quickLink}><Calendar size={15} />       Manage Events</Link>
              <Link href="/admin/messages"                      className={styles.quickLink}><MessageSquare size={15} />  View Messages</Link>
              <Link href="/admin/opportunities/vacancies"       className={styles.quickLink}><Briefcase size={15} />      Vacancies</Link>
              <Link href="/admin/opportunities/applications"    className={styles.quickLink}><GraduationCap size={15} />  Applications</Link>
              <Link href="/admin/store/orders"                  className={styles.quickLink}><ShoppingBag size={15} />    Store Orders</Link>
            </nav>
          </section>
        </div>

      </div>
    </div>
  );
}
