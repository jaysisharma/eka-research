"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

import {
  LayoutDashboard,
  User,
  Telescope,
  CalendarDays,
  Database,
  FolderKanban,
  ChevronRight,
  Plus,
  LogOut,
} from "lucide-react";

import styles from "./page.module.css";

const METRICS = [
  {
    label: "Pending Reviews",
    value: "08",
  },
  {
    label: "Active Sessions",
    value: "12",
  },
  {
    label: "Datasets",
    value: "482",
  },
  {
    label: "Array Uptime",
    value: "99.8%",
  },
];

const ACTIVITIES = [
  {
    title: "Lyrid Meteor Observation Completed",
    type: "Research Session",
    time: "2h ago",
  },
  {
    title: "Atmospheric Dataset Uploaded",
    type: "Dataset",
    time: "5h ago",
  },
  {
    title: "Calibration Suite Execution Finished",
    type: "System Run",
    time: "8h ago",
  },
  {
    title: "Observation Validation Completed",
    type: "Verification",
    time: "Yesterday",
  },
];

const ACTIONS = [
  "New Observation",
  "Upload Dataset",
  "Schedule Session",
  "Invite Member",
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name ?? "Researcher";

  return (
    <div className={styles.layout}>


      {/* ───────────────────── */}
      {/* MAIN */}
      {/* ───────────────────── */}

      <main className={styles.main}>

        {/* PAGE HEADER */}

        <header className={styles.pageHeader}>

          <div>
            <h1 className={styles.pageTitle}>
              Dashboard
            </h1>

            <p className={styles.pageSubtitle}>
              Welcome back, {userName}
            </p>
          </div>
        </header>

        {/* FOCUS CARD */}

        <section className={styles.focusCard}>

          <div className={styles.focusTop}>

            <span className={styles.focusLabel}>
              TODAY'S PRIORITY
            </span>

            <span className={styles.focusStatus}>
              Active
            </span>
          </div>

          <h2 className={styles.focusTitle}>
            Deep Space Atmospheric Observation
          </h2>

          <p className={styles.focusText}>
            Continue reviewing incoming telescope
            observation data and validate pending
            atmospheric readings.
          </p>

          <div className={styles.focusActions}>

            <button className={styles.primaryBtn}>
              Continue Session
            </button>

            <button className={styles.secondaryBtn}>
              Open Details
            </button>
          </div>
        </section>

        {/* METRICS */}

        <section className={styles.metricsGrid}>
          {METRICS.map((item) => (
            <div
              key={item.label}
              className={styles.metricCard}
            >
              <span className={styles.metricLabel}>
                {item.label}
              </span>

              <strong className={styles.metricValue}>
                {item.value}
              </strong>
            </div>
          ))}
        </section>

        {/* CONTENT */}

        <section className={styles.contentGrid}>

          {/* LEFT */}

          <div className={styles.leftCol}>

            {/* ACTIVITY */}

            <div className={styles.card}>

              <div className={styles.cardHeader}>

                <h3 className={styles.cardTitle}>
                  Recent Activity
                </h3>

                <Link
                  href="/activity"
                  className={styles.cardLink}
                >
                  View All
                </Link>
              </div>

              <div className={styles.activityList}>
                {ACTIVITIES.map((item) => (
                  <div
                    key={item.title}
                    className={styles.activityItem}
                  >
                    <div className={styles.activityLeft}>

                      <div className={styles.activityDot} />

                      <div>

                        <h4 className={styles.activityTitle}>
                          {item.title}
                        </h4>

                        <div className={styles.activityMeta}>
                          <span>{item.type}</span>

                          <span>•</span>

                          <span>{item.time}</span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight
                      size={16}
                      className={styles.activityArrow}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* QUICK ACTIONS */}

            <div className={styles.card}>

              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  Quick Actions
                </h3>
              </div>

              <div className={styles.actionsGrid}>
                {ACTIONS.map((item) => (
                  <button
                    key={item}
                    className={styles.actionBtn}
                  >
                    <Plus size={16} />

                    <span>{item}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT */}

          <aside className={styles.rightCol}>

            {/* ASSIGNED TASKS */}

            <div className={styles.card}>

              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  Assigned Tasks
                </h3>
              </div>

              <div className={styles.taskList}>

                <div className={styles.taskItem}>

                  <div>
                    <h4 className={styles.taskTitle}>
                      Validate Observation Logs
                    </h4>

                    <p className={styles.taskMeta}>
                      Due Today
                    </p>
                  </div>

                  <span className={styles.taskBadge}>
                    High
                  </span>
                </div>

                <div className={styles.taskItem}>

                  <div>
                    <h4 className={styles.taskTitle}>
                      Review Dataset Upload
                    </h4>

                    <p className={styles.taskMeta}>
                      Tomorrow
                    </p>
                  </div>

                  <span className={styles.taskBadge}>
                    Medium
                  </span>
                </div>

                <div className={styles.taskItem}>

                  <div>
                    <h4 className={styles.taskTitle}>
                      Prepare Session Report
                    </h4>

                    <p className={styles.taskMeta}>
                      Friday
                    </p>
                  </div>

                  <span className={styles.taskBadge}>
                    Low
                  </span>
                </div>
              </div>
            </div>

            {/* UPCOMING */}

            <div className={styles.card}>

              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  Upcoming
                </h3>
              </div>

              <div className={styles.upcomingList}>

                <div className={styles.upcomingItem}>
                  <span>Research Symposium</span>
                  <strong>Tomorrow</strong>
                </div>

                <div className={styles.upcomingItem}>
                  <span>Dataset Review Meeting</span>
                  <strong>Friday</strong>
                </div>

                <div className={styles.upcomingItem}>
                  <span>Observation Session</span>
                  <strong>May 24</strong>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}