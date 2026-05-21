"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Search, 
  CalendarDays, 
  Tag, 
  Clock, 
  CheckCircle2, 
  Rocket, 
  ArrowRight, 
  X,
  Sparkles,
  Inbox
} from "lucide-react";
import { type Project, type ProjectStatus } from "@/lib/constants";
import styles from "@/app/projects/page.module.css";

const STATUS_LABEL: Record<ProjectStatus | "all", string> = {
  all:       "All Work",
  ongoing:   "Ongoing",
  completed: "Completed",
  upcoming:  "Upcoming",
};

const STATUS_CLASS: Record<ProjectStatus, string> = {
  ongoing:   "statusOngoing",
  completed: "statusCompleted",
  upcoming:  "statusUpcoming",
};

const PHASES = [
  "Planning", 
  "Funding", 
  "Instrument Design", 
  "Site Survey", 
  "Pre-launch", 
  "Active"
];

function getPhaseIndex(phase?: string) {
  if (!phase) return -1;
  const idx = PHASES.findIndex(p => p.toLowerCase() === phase.toLowerCase());
  return idx !== -1 ? idx : PHASES.indexOf(phase);
}

interface ProjectCatalogExplorerProps {
  projects: Project[];
  initialStatus: string;
}

export default function ProjectCatalogExplorer({ 
  projects, 
  initialStatus 
}: ProjectCatalogExplorerProps) {
  const searchParams = useSearchParams();

  // 1. Core Filter States
  const [activeStatus, setActiveStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Sync initial state from URL on load
  useEffect(() => {
    const urlStatus = searchParams?.get("status");
    if (urlStatus && ["ongoing", "completed", "upcoming"].includes(urlStatus)) {
      setActiveStatus(urlStatus);
    } else if (initialStatus && ["ongoing", "completed", "upcoming"].includes(initialStatus)) {
      setActiveStatus(initialStatus);
    }
  }, [searchParams, initialStatus]);

  // 2. Tab Trigger: Updates state and address bar in real time without refreshing
  const handleStatusChange = (status: string) => {
    setActiveStatus(status);
    const params = new URLSearchParams(window.location.search);
    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    const newPath = params.toString() 
      ? `${window.location.pathname}?${params.toString()}` 
      : window.location.pathname;
    window.history.pushState(null, "", newPath);
  };

  // 3. Aggregate all unique tags from active/all projects dynamically
  const allUniqueTags = useMemo(() => {
    const tagsSet = new Set<string>();
    projects.forEach(p => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach(t => tagsSet.add(t));
      }
    });
    return Array.from(tagsSet).sort();
  }, [projects]);

  // 4. Perform live filtering across search query, selected status, and selected tags
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Filter by status
      if (activeStatus !== "all" && project.status !== activeStatus) {
        return false;
      }

      // Filter by selected tags (AND logic: project must contain all selected tags)
      if (selectedTags.length > 0) {
        const hasAllTags = selectedTags.every(t => project.tags.includes(t));
        if (!hasAllTags) return false;
      }

      // Filter by keyword search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = project.title.toLowerCase().includes(q);
        const matchesDesc = project.description.toLowerCase().includes(q);
        const matchesTags = project.tags.some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [projects, activeStatus, selectedTags, searchQuery]);

  // Toggle selected tags helper
  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  // Reset all search and filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
    handleStatusChange("all");
  };

  return (
    <div className={styles.explorerWrapper}>
      
      {/* ── Search & Segmented Navigation Controls ── */}
      <div className={styles.controlsGrid}>
        
        {/* Glassmorphic Search Bar */}
        <div className={styles.searchContainer}>
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} size={18} />
            <input
              type="text"
              placeholder="Search projects, instruments, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              aria-label="Search projects"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                className={styles.searchClearBtn}
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Glassmorphic Segmented Tabs */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabsWrapper}>
            {(["all", "ongoing", "upcoming", "completed"] as const).map((statusKey) => (
              <button
                key={statusKey}
                onClick={() => handleStatusChange(statusKey)}
                className={`${styles.tabBtn} ${activeStatus === statusKey ? styles.activeTab : ""}`}
              >
                {STATUS_LABEL[statusKey]}
                {activeStatus === statusKey && (
                  <span className={styles.tabIndicatorGlow} aria-hidden="true" />
                )}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ── Dynamic Tag Cloud Cloud ── */}
      {allUniqueTags.length > 0 && (
        <div className={styles.tagCloudSection}>
          <div className={styles.tagCloudHeader}>
            <span className={styles.tagCloudTitle}>
              <Tag size={12} />
              Filter by Tag
            </span>
            {selectedTags.length > 0 && (
              <button 
                onClick={() => setSelectedTags([])} 
                className={styles.tagClearAllBtn}
              >
                Clear tags ({selectedTags.length})
              </button>
            )}
          </div>
          <div className={styles.tagChipsList}>
            {allUniqueTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`${styles.tagChip} ${isSelected ? styles.tagChipActive : ""}`}
                  aria-pressed={isSelected}
                >
                  {tag}
                  {isSelected && <X size={10} className={styles.chipX} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Dynamic Match Indicators ── */}
      <div className={styles.matchBar}>
        <div className={styles.matchCount}>
          <Sparkles size={13} className={styles.sparkleIcon} />
          Showing <span className={styles.highlightCount}>{filteredProjects.length}</span> of{" "}
          {projects.length} project{projects.length === 1 ? "" : "s"}
        </div>
        {(searchQuery || selectedTags.length > 0 || activeStatus !== "all") && (
          <button 
            onClick={handleResetFilters} 
            className={styles.resetAllBtn}
          >
            Reset all filters
          </button>
        )}
      </div>

      {/* ── Projects Grid Layout ── */}
      {filteredProjects.length > 0 ? (
        <div className={styles.grid}>
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <Inbox size={48} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No projects found</h3>
          <p className={styles.emptyDesc}>
            No projects match your current combinations of search queries, selected statuses, and tag selections.
          </p>
          <button onClick={handleResetFilters} className={styles.emptyBtn}>
            Clear all filters
          </button>
        </div>
      )}

      {/* ── Premium Bottom Roster Banner CTA ── */}
      <div className={styles.ctaBanner}>
        <div className={styles.ctaBannerInner}>
          <div className={styles.ctaBannerGlow} aria-hidden="true" />
          <div className={styles.ctaBannerContent}>
            <span className={styles.ctaBannerBadge}>Get Involved</span>
            <h3 className={styles.ctaBannerHeading}>
              Want to contribute to a <span className={styles.ctaGoldAccent}>live project?</span>
            </h3>
            <p className={styles.ctaBannerDesc}>
              Eka Research is powered by collaborative effort. Members get early access to telemetry logs, orbital solvers, and balloon payloads.
            </p>
          </div>
          <div className={styles.ctaBannerActions}>
            <Link href="/member-benefits" className={styles.ctaMainBtn}>
              Become a member <ArrowRight size={15} />
            </Link>
            <Link href="/contact" className={styles.ctaSecBtn}>
              Partner with us
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}

/* ── Refactored Subcomponent: Premium Interactive Project Card ── */
function ProjectCard({ project }: { project: Project }) {
  const phaseIdx = getPhaseIndex(project.phase);

  return (
    <div className={styles.cardContainer}>
      <Link href={project.href} className={styles.cardLinkOuter}>
        
        {/* Cover image wrap */}
        <div className={styles.cardImgFrame}>
          <Image
            src={project.image}
            alt={project.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={styles.cardImage}
          />
          <div className={styles.cardImageOverlay} />
          
          {/* Top Status Badge */}
          <div className={`${styles.badgeStatus} ${styles[STATUS_CLASS[project.status]]}`}>
            <span className={styles.badgeDot} />
            {STATUS_LABEL[project.status]}
          </div>
        </div>

        {/* Card details body */}
        <div className={styles.cardBody}>
          
          <div className={styles.cardMetaRow}>
            <span className={styles.cardPeriodInfo}>
              <CalendarDays size={12} />
              {project.period}
            </span>
          </div>

          <h3 className={styles.cardTitle}>{project.title}</h3>
          
          <p className={styles.cardDescription}>{project.description}</p>

          {/* Outcome highlight for Completed Projects */}
          {project.status === "completed" && project.outcome && (
            <div className={styles.outcomeBlock}>
              <div className={styles.outcomeTitleRow}>
                <CheckCircle2 size={13} className={styles.outcomeCheckIcon} />
                <span className={styles.outcomeHeading}>Impact Highlight</span>
              </div>
              <p className={styles.outcomeContent}>{project.outcome}</p>
            </div>
          )}

          {/* Development Phase progress track for Upcoming Projects */}
          {project.status === "upcoming" && project.phase && phaseIdx >= 0 && (
            <div className={styles.progressContainer}>
              <div className={styles.progressLabelRow}>
                <span className={styles.progressTitle}>Development Phase</span>
                <span className={styles.progressValue}>{project.phase}</span>
              </div>
              <div className={styles.progressTrack}>
                {PHASES.map((phaseName, index) => (
                  <div
                    key={phaseName}
                    className={`${styles.progressBarStep} ${
                      index <= phaseIdx ? styles.stepActive : ""
                    } ${index === phaseIdx ? styles.stepCurrent : ""}`}
                    title={phaseName}
                  />
                ))}
              </div>
              <div className={styles.progressRange}>
                <span>{PHASES[0]}</span>
                <span>{PHASES[PHASES.length - 1]}</span>
              </div>
            </div>
          )}

          {/* Project tag labels */}
          <div className={styles.cardTagsCloud}>
            {project.tags.map((tag) => (
              <span key={tag} className={styles.cardTagItem}>
                <Tag size={9} />
                {tag}
              </span>
            ))}
          </div>

          {/* Hover dynamic explore link */}
          <div className={styles.cardActionLink}>
            <span>Project details</span>
            <ArrowRight size={14} className={styles.arrowIcon} />
          </div>

        </div>

      </Link>
    </div>
  );
}
