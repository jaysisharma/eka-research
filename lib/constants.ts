/** ============================================================
 *  EKA RESEARCH — Site-wide constants
 *  All static data lives here. Components import from this file.
 *  ============================================================ */

/** Replace with your real domain before going live */
export const SITE_URL = "https://ekaresearch.org";

export const SITE = {
  name: "Eka Research",
  tagline: "Expanding the frontiers of space science",
  description:
    "An interdisciplinary research and outreach organisation based in Kathmandu — advancing physics, astrophysics, mathematics, and space science while making rigorous science accessible to every curious mind across Nepal and beyond.",
  hq: "Nepal",
  presence: "Germany | Thailand",
  email: "hello@ekaresearch.org",
  foundedYear: 2020,
} as const;

export type NavChild = {
  label: string;
  href: string;
  description?: string;
};

export type NavLink = {
  label: string;
  href: string;
  /** Renders with a gold accent to draw attention */
  highlight?: boolean;
  children?: NavChild[];
};

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  {
    label: "Services",
    href: "/services",
    children: [
      {
        label: "The Public",
        href: "/services/public",
        description: "Open outreach events and science communication for all ages",
      },
      {
        label: "Schools",
        href: "/services/schools",
        description: "Workshops and curriculum support for students and educators",
      },
      {
        label: "Researchers",
        href: "/services/researchers",
        description: "Exclusive resources for researchers and students",
      },
      {
        label: "All Sky Camera",
        href: "/services/allsky",
        description: "Live full-sky imaging — meteor showers and aurora activity",
      },
      {
        label: "Weather Station",
        href: "/services/weather",
        description: "Real-time atmospheric data from Kathmandu valley",
      },
      {
        label: "Mentoring Program",
        href: "/services/mentoring",
        description: "Connect with mentors from academia and industry",
      },
    ],
  },
  {
    label: "Research",
    href: "/research",
    children: [
      { label: "Research Overview", href: "/research" },
      { label: "Articles", href: "/articles" },
      { label: "News", href: "/news" },
    ],
  },
  {
    label: "Projects",
    href: "/projects",
    children: [
      { label: "Upcoming Projects", href: "/projects/upcoming" },
      { label: "Past Projects", href: "/projects/past" },
    ],
  },
  {
    label: "Opportunities",
    href: "/opportunities",
    children: [
      { label: "Join Us", href: "/auth/signup" },
      { label: "Mentoring Program", href: "/opportunities/mentoring" },
      { label: "Vacancies", href: "/opportunities/vacancy" },
    ],
  },
  { label: "Store", href: "/store" },
  { label: "Member Benefits", href: "/member-benefits", highlight: true },
];

/* ── REPLACE with real data from the client ── */
export type ProjectStatus = "ongoing" | "completed" | "upcoming";

export type Project = {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  /** Year or "YYYY – YYYY" range */
  period: string;
  tags: string[];
  image: string;
  href: string;
  featured?: boolean;
  /** Completed projects: one-line impact statement */
  outcome?: string;
  /** Upcoming projects: current development phase */
  phase?: string;
  /** Upcoming projects: expected launch window */
  launchTarget?: string;
};

export const PROJECTS: Project[] = [
  // ── Ongoing ────────────────────────────────────────────────
  {
    id: "allsky-camera-network",
    title: "All Sky Camera Network",
    description:
      "A nationwide network of wide-field cameras monitoring Nepal's skies 24/7 — detecting meteors, fireballs, and transient atmospheric events in real time.",
    status: "ongoing",
    period: "2022 – present",
    tags: ["Meteor Science", "Instrumentation", "Data"],
    image:
      "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1200&q=80",
    href: "/projects/allsky-camera-network",
    featured: true,
  },
  {
    id: "himalayan-weather-network",
    title: "Himalayan Weather Station Network",
    description:
      "A distributed network of automated weather stations positioned across Nepal's altitudinal gradient — from Terai lowlands to alpine zones — providing real-time atmospheric data for research and forecasting.",
    status: "ongoing",
    period: "2023 – present",
    tags: ["Atmospheric Science", "Climate", "Instrumentation"],
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
    href: "/projects/himalayan-weather-network",
    featured: false,
  },

  // ── Upcoming ────────────────────────────────────────────────
  {
    id: "eclipse-expedition-2027",
    title: "Eclipse Expedition 2027",
    description:
      "Nepal's first coordinated solar eclipse observation campaign — engaging 500+ students across 15 districts with loaned eclipse glasses, trained facilitators, and a live data collection portal.",
    status: "upcoming",
    period: "2027",
    tags: ["Outreach", "Solar", "Education"],
    image:
      "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=800&q=80",
    href: "/projects/eclipse-expedition-2027",
    featured: false,
    phase: "Planning",
    launchTarget: "Q1 2027",
  },
  {
    id: "meteor-spectral-survey",
    title: "Nepal Meteor Spectral Survey",
    description:
      "The first systematic spectroscopic survey of meteors over the Himalayan region — coupling all-sky cameras with transmission gratings to classify meteoroid compositions and identify rare mineral signatures.",
    status: "upcoming",
    period: "2026",
    tags: ["Meteor Science", "Spectroscopy", "Data"],
    image:
      "https://images.unsplash.com/photo-1520034475321-cbe63696469a?auto=format&fit=crop&w=800&q=80",
    href: "/projects/meteor-spectral-survey",
    featured: false,
    phase: "Instrument Design",
    launchTarget: "Q3 2026",
  },
  {
    id: "dark-sky-initiative",
    title: "Himalayan Dark Sky Initiative",
    description:
      "A scientific and policy campaign to formally designate priority mountain sites in Nepal as International Dark Sky Places — quantifying light pollution, engaging local governments, and establishing long-term monitoring.",
    status: "upcoming",
    period: "2026 – 2028",
    tags: ["Light Pollution", "Policy", "Astronomy"],
    image:
      "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=800&q=80",
    href: "/projects/dark-sky-initiative",
    featured: false,
    phase: "Site Survey",
    launchTarget: "Mid 2026",
  },

  // ── Completed ───────────────────────────────────────────────
  {
    id: "stratonepal",
    title: "StratoNepal Balloon Payload",
    description:
      "High-altitude balloon missions carrying scientific payloads to the stratosphere — measuring cosmic ray flux, UV radiation, and atmospheric composition above the Himalayas.",
    status: "completed",
    period: "2021 – 2023",
    tags: ["Atmospheric Physics", "Hardware", "Balloon"],
    image:
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80",
    href: "/projects/stratonepal",
    featured: false,
    outcome: "4 successful flights reaching 28 km altitude; UV and cosmic ray datasets open-published.",
  },
  {
    id: "geminid-campaign-2023",
    title: "Geminid Observation Campaign 2023",
    description:
      "A coordinated multi-site naked-eye and photographic observation of the Geminid meteor shower, recruiting 120 citizen scientists at 8 dark-sky sites across three provinces.",
    status: "completed",
    period: "2023",
    tags: ["Meteor Science", "Citizen Science", "Outreach"],
    image:
      "https://images.unsplash.com/photo-1579632652768-6cb9dcf85912?auto=format&fit=crop&w=800&q=80",
    href: "/projects/geminid-campaign-2023",
    featured: false,
    outcome: "3,800+ meteors logged; flux curve produced and submitted to the IMO database.",
  },
  {
    id: "school-telescope-initiative",
    title: "School Telescope Initiative",
    description:
      "Donated and installed 18 refractor telescopes across rural schools in Koshi and Gandaki provinces, paired with a structured 6-session astronomy curriculum delivered by Eka volunteers.",
    status: "completed",
    period: "2022",
    tags: ["Education", "Outreach", "Instrumentation"],
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
    href: "/projects/school-telescope-initiative",
    featured: false,
    outcome: "18 telescopes placed, 1,400+ students reached, curriculum now freely downloadable.",
  },
];

export type EventType = "workshop" | "observation" | "lecture" | "outreach" | "conference";

export type EkaEvent = {
  id: string;
  title: string;
  description: string;
  type: EventType;
  date: string;
  time: string;
  location: string;
  locationDetail?: string;
  seats?: number;
  seatsLeft?: number;
  href: string;
  registrationHref?: string;
};

export const EVENTS: EkaEvent[] = [
  {
    id: "meteor-watch-april-2026",
    title: "Lyrid Meteor Watch Night",
    description:
      "Join us for a guided naked-eye observation of the Lyrid meteor shower from a dark-sky site outside Kathmandu. Open to all levels — telescopes and hot tea provided.",
    type: "observation",
    date: "2026-04-22",
    time: "8:00 PM NPT",
    location: "Nagarkot, Bhaktapur",
    locationDetail: "Dark Sky Site",
    seats: 40,
    seatsLeft: 12,
    href: "/events/lyrid-meteor-watch-2026",
    registrationHref: "/events/lyrid-meteor-watch-2026#register",
  },
  {
    id: "intro-astronomy-workshop",
    title: "Introduction to Astronomy Workshop",
    description:
      "A one-day hands-on workshop covering the basics of naked-eye observation, star maps, telescope operation, and how to get involved in citizen science from Nepal.",
    type: "workshop",
    date: "2026-05-10",
    time: "10:00 AM NPT",
    location: "Kathmandu",
    locationDetail: "Eka Research Centre",
    seats: 25,
    seatsLeft: 9,
    href: "/events/intro-astronomy-workshop-2026",
    registrationHref: "/events/intro-astronomy-workshop-2026#register",
  },
  {
    id: "space-weather-lecture",
    title: "Public Lecture: Space Weather & You",
    description:
      "How solar storms affect satellites, power grids, and GPS — and what Nepali researchers are doing to monitor them. Free entry, open to the public.",
    type: "lecture",
    date: "2026-05-28",
    time: "5:30 PM NPT",
    location: "Kathmandu",
    locationDetail: "Tribhuvan University, Physics Dept.",
    href: "/events/space-weather-lecture-2026",
    registrationHref: "/events/space-weather-lecture-2026#register",
  },
];

export type MemberBenefit = {
  id: string;
  icon: string;
  title: string;
  description: string;
};

export const MEMBER_BENEFITS: MemberBenefit[] = [
  {
    id: "events",
    icon: "CalendarCheck",
    title: "Priority Event Access",
    description: "Register for observation nights, workshops, and field trips before they open to the public — seats go fast.",
  },
  {
    id: "telescope",
    icon: "Telescope",
    title: "Telescope & Instrument Time",
    description: "Book dedicated observation slots on Eka's instruments, including the All Sky Camera network and weather station.",
  },
  {
    id: "mentoring",
    icon: "GraduationCap",
    title: "Mentoring Program",
    description: "Get matched with a researcher or academic mentor for guidance on projects, publications, and career paths.",
  },
  {
    id: "data",
    icon: "Database",
    title: "Research Data Access",
    description: "Full access to Eka's meteor, atmospheric, and space weather datasets — cleaned, documented, and ready to use.",
  },
  {
    id: "network",
    icon: "Network",
    title: "Researcher Network",
    description: "Join a growing community of Nepali scientists, students, and international collaborators working in space science.",
  },
  {
    id: "certificate",
    icon: "Award",
    title: "Member Certificate",
    description: "Official Eka Research membership certificate — recognised by partner universities and institutions across Nepal.",
  },
];

/* ── ARTICLES ── */
export type ArticleType = "journal" | "conference" | "preprint" | "report";

export type Article = {
  id: string;
  title: string;
  /** Full author list exactly as it should appear */
  authors: string[];
  /** Subset of authors who are Eka members — highlighted in gold */
  ekaAuthors: string[];
  journal: string;
  year: number;
  date: string;
  type: ArticleType;
  disciplines: string[];
  abstract: string;
  image: string;
  doi?: string;
  arxiv?: string;
  featured?: boolean;
};

export const ARTICLES: Article[] = [
  {
    id: "meteor-network-nepal-2024",
    title: "Establishing a Multi-Station Meteor Detection Network in the Himalayas: Methodology and First Results",
    authors: ["A. Sharma", "P. Thapa", "R. Adhikari", "M. Karki", "T. Shrestha"],
    ekaAuthors: ["A. Sharma", "P. Thapa", "R. Adhikari"],
    journal: "Monthly Notices of the Royal Astronomical Society",
    year: 2024,
    date: "2024-09-15",
    type: "journal",
    disciplines: ["Meteor Science", "Instrumentation"],
    abstract:
      "We present the design, deployment, and early results of a five-station All Sky Camera network operated by Eka Research across Nepal's mid-hill region. During its first operational year the network recorded 3,847 meteors and triangulated 214 multi-station events, yielding precise orbital solutions for 89 sporadic meteors and members of four established streams.",
    image: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1200&q=80",
    doi: "10.1093/mnras/stae2241",
    featured: true,
  },
  {
    id: "geomagnetic-south-asia-2024",
    title: "Ionospheric Response to the May 2024 Geomagnetic Storm over South Asia",
    authors: ["M. Karki", "A. Sharma", "S. Bajracharya"],
    ekaAuthors: ["M. Karki", "A. Sharma"],
    journal: "Journal of Geophysical Research: Space Physics",
    year: 2024,
    date: "2024-11-03",
    type: "journal",
    disciplines: ["Space Weather", "Atmospheric Physics"],
    abstract:
      "Using dual-frequency GPS receivers and Eka's ground-based magnetometer array, we characterise the ionospheric total electron content (TEC) response to the extreme geomagnetic storm of 10–12 May 2024 — the strongest event in two decades — over Nepal and northern India.",
    image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=800&q=80",
    doi: "10.1029/2024JA032917",
  },
  {
    id: "stratonepal-01-2023",
    title: "StratoNepal-01: Atmospheric and Cosmic Ray Measurements from a High-Altitude Balloon at 28 km over the Central Himalayas",
    authors: ["P. Thapa", "R. Adhikari", "A. Sharma", "K. Pandey"],
    ekaAuthors: ["P. Thapa", "R. Adhikari", "A. Sharma"],
    journal: "Atmospheric Measurement Techniques",
    year: 2023,
    date: "2023-06-22",
    type: "journal",
    disciplines: ["Atmospheric Physics", "Instrumentation"],
    abstract:
      "We describe the instrument package, flight profile, and primary data products of the StratoNepal-01 mission — the first scientific stratospheric balloon launched from Nepali territory. The payload recorded temperature, pressure, ozone concentration, and Geiger-Müller counts from ground to burst altitude.",
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80",
    doi: "10.5194/amt-16-3041-2023",
    arxiv: "2302.14821",
  },
  {
    id: "fireball-spectroscopy-2023",
    title: "Optical Spectroscopy of a Bright Fireball Detected over the Kathmandu Valley",
    authors: ["R. Adhikari", "A. Sharma", "T. Shrestha"],
    ekaAuthors: ["R. Adhikari", "A. Sharma", "T. Shrestha"],
    journal: "Meteoritics & Planetary Science (Conference Supplement)",
    year: 2023,
    date: "2023-08-11",
    type: "conference",
    disciplines: ["Meteor Science"],
    abstract:
      "A magnitude −7 fireball recorded simultaneously by three Eka cameras on 14 March 2023 enabled spectroscopic analysis using a diffraction grating attached to one station. We identify sodium, magnesium, and iron emission lines consistent with a chondritic composition.",
    image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=80",
    arxiv: "2308.05612",
  },
  {
    id: "astronomy-education-nepal-2022",
    title: "Barriers and Opportunities for Astronomy Education in Secondary Schools across Nepal: A Survey of 320 Students and 45 Teachers",
    authors: ["S. Bajracharya", "A. Sharma", "L. Gurung"],
    ekaAuthors: ["S. Bajracharya", "A. Sharma"],
    journal: "arXiv (Education)",
    year: 2022,
    date: "2022-11-07",
    type: "preprint",
    disciplines: ["Science Education"],
    abstract:
      "We surveyed 320 students and 45 physics teachers across five provinces to assess the state of astronomy education in Nepali secondary schools. Identified barriers include limited access to equipment, no dedicated astronomy curriculum, and a lack of trained educators.",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
    arxiv: "2211.03847",
  },
  {
    id: "variable-star-survey-2022",
    title: "A Photometric Survey of Long-Period Variable Stars Visible from High-Altitude Sites in Nepal",
    authors: ["T. Shrestha", "P. Thapa", "A. Sharma"],
    ekaAuthors: ["T. Shrestha", "P. Thapa", "A. Sharma"],
    journal: "Publications of the Astronomical Society of the Pacific",
    year: 2022,
    date: "2022-03-19",
    type: "journal",
    disciplines: ["Observational Astronomy", "Astrophysics"],
    abstract:
      "We present V-band light curves of 47 long-period variable stars monitored over two seasons from Eka's Nagarkot observation site at 2,175 m altitude. Period solutions are derived for 38 stars, of which 6 have no previously published periods in the AAVSO or GCVS catalogues.",
    image: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?auto=format&fit=crop&w=800&q=80",
    doi: "10.1088/1538-3873/ac5f2a",
  },
];

export type ResearchArea = {
  id: string;
  icon: string;
  /** Path relative to public/ — replace with real photo from client */
  image: string;
  title: string;
  description: string;
  href: string;
};

export const RESEARCH_AREAS: ResearchArea[] = [
  {
    id: "observational-astronomy",
    icon: "Telescope",
    image:
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=80",
    title: "Observational Astronomy",
    description:
      "Telescopic observation of celestial objects, variable stars, and transient events from high-altitude sites across Nepal.",
    href: "/research#observational-astronomy",
  },
  {
    id: "meteor-science",
    icon: "Sparkles",
    image:
      "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=800&q=80",
    title: "Meteor Science",
    description:
      "Detection and trajectory analysis of meteor showers using our All Sky Camera network — building Nepal's first meteor database.",
    href: "/research#meteor-science",
  },
  {
    id: "space-weather",
    icon: "Sun",
    image:
      "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=800&q=80",
    title: "Space Weather",
    description:
      "Monitoring solar wind, geomagnetic storms, and ionospheric disturbances and their regional effects over South Asia.",
    href: "/research#space-weather",
  },
  {
    id: "atmospheric-physics",
    icon: "Wind",
    image:
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80",
    title: "Atmospheric Physics",
    description:
      "Upper atmosphere studies using weather balloon payloads, GPS occultation, and ground-based remote sensing instruments.",
    href: "/research#atmospheric-physics",
  },
  {
    id: "astrophysics-and-physics",
    icon: "Atom",
    image:
      "https://images.unsplash.com/photo-1543722530-d2c3201371e7?auto=format&fit=crop&w=800&q=80",
    title: "Astrophysics & Physics",
    description:
      "Theoretical, computational, and mathematical research into stellar evolution, galactic dynamics, high-energy phenomena, and foundational physics.",
    href: "/research#astrophysics",
  },
  {
    id: "science-communication",
    icon: "BookOpen",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
    title: "Science Communication",
    description:
      "Evidence-based methods for communicating physics and astronomy — from classroom curriculum design to public science writing and research mentoring.",
    href: "/research#science-communication",
  },
];

/* ── VACANCIES ── */
export type VacancyType = "full-time" | "part-time" | "internship" | "volunteer" | "contract";
export type VacancyStatus = "open" | "closed";

export type Vacancy = {
  id: string;
  title: string;
  department: string;
  type: VacancyType;
  location: string;
  remote: boolean;
  /** ISO 8601 date string */
  deadline: string;
  status: VacancyStatus;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  preferred?: string[];
};

export const VACANCIES: Vacancy[] = [
  {
    id: "research-assistant-meteor",
    title: "Research Assistant — Meteor Science",
    department: "Research",
    type: "part-time",
    location: "Kathmandu",
    remote: false,
    deadline: "2026-04-30",
    status: "open",
    summary:
      "Support Eka's All Sky Camera network: process observation data, maintain field stations, and contribute to meteor trajectory analysis.",
    responsibilities: [
      "Operate and maintain All Sky Camera nodes across the Kathmandu valley",
      "Process raw camera frames using Eka's Python-based pipeline tools",
      "Assist in triangulating multi-station events and computing orbital parameters",
      "Document anomalous events and update the shared observation log",
      "Contribute to monthly network status reports",
    ],
    requirements: [
      "Enrolled in or graduate of a BSc/MSc in physics, astronomy, or engineering",
      "Comfortable with Python for data processing and scripting",
      "Able to commit 15–20 hours per week, including some evening observation shifts",
      "Based in or willing to relocate to Kathmandu",
    ],
    preferred: [
      "Prior experience with image processing or astrometry software",
      "Familiarity with FITS files or similar scientific image formats",
    ],
  },
  {
    id: "education-coordinator",
    title: "Education Programme Coordinator",
    department: "Education & Outreach",
    type: "full-time",
    location: "Kathmandu",
    remote: false,
    deadline: "2026-05-15",
    status: "open",
    summary:
      "Design and run Eka's school and public outreach programmes — from curriculum workshops to observation nights — across Nepal.",
    responsibilities: [
      "Plan and deliver astronomy workshops for schools across at least three provinces",
      "Coordinate public events: observation nights, public lectures, and citizen science campaigns",
      "Develop curriculum-aligned resource packs for Nepali physics teachers",
      "Manage volunteer educators and coordinate event logistics",
      "Track participation data and write quarterly programme impact reports",
    ],
    requirements: [
      "Bachelor's degree or higher in science, education, or a related field",
      "2+ years experience in programme coordination, science communication, or teaching",
      "Fluency in both Nepali and English",
      "Strong organisational skills and comfort with managing multiple workstreams",
    ],
    preferred: [
      "Background in astronomy or physics",
      "Experience working with schools in Nepal's hill or mountain regions",
      "Familiarity with Nepal's secondary science curriculum frameworks",
    ],
  },
  {
    id: "data-engineering-intern",
    title: "Data Engineering Intern",
    department: "Research",
    type: "internship",
    location: "Remote / Kathmandu",
    remote: true,
    deadline: "2026-04-15",
    status: "open",
    summary:
      "Build and maintain the pipelines that power Eka's public data portal — cleaning, archiving, and exposing meteor, weather, and space weather datasets.",
    responsibilities: [
      "Build and maintain ETL pipelines for ingesting camera, weather-station, and magnetometer data",
      "Improve data validation and anomaly-detection routines in Python",
      "Document datasets and write user-facing API guides for the member data portal",
      "Assist with database schema design and query optimisation",
    ],
    requirements: [
      "Enrolled in or recently graduated from a CS, data science, or engineering programme",
      "Solid Python skills; comfortable with pandas or numpy",
      "Able to work in a remote-first, async environment",
    ],
    preferred: [
      "Experience with scientific data formats (FITS, NetCDF, HDF5)",
      "Knowledge of PostgreSQL or any time-series database",
      "Open-source contribution history",
    ],
  },
];

/* ── STORE ── */
export type ProductCategory = "apparel" | "educational" | "kits" | "digital";

export type ProductVariantGroup = {
  name: string;
  options: string[];
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: ProductCategory;
  priceNpr: number;
  description: string;
  includes?: string[];
  variants?: ProductVariantGroup[];
  badge?: string;
  inStock: boolean;
  digital: boolean;
  /** CSS gradient string used as the image placeholder */
  gradient: string;
  /** Cloudinary image URL — takes precedence over gradient */
  imageUrl?: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "eka-classic-tee",
    slug: "eka-classic-tee",
    name: "Eka Research Classic Tee",
    tagline: "Wear the mission",
    category: "apparel",
    priceNpr: 1200,
    description:
      "100% cotton heavyweight tee in black with the Eka Research wordmark embroidered on the chest. Printed on ethically sourced fabric, made in Nepal.",
    variants: [
      { name: "Size", options: ["S", "M", "L", "XL", "XXL"] },
      { name: "Colour", options: ["Black", "Navy Blue"] },
    ],
    badge: "Popular",
    inStock: true,
    digital: false,
    gradient: "linear-gradient(135deg, #1a2060 0%, #0a0d22 100%)",
  },
  {
    id: "eka-hoodie",
    slug: "eka-hoodie",
    name: "Eka Research Hoodie",
    tagline: "For late-night observation sessions",
    category: "apparel",
    priceNpr: 2500,
    description:
      "Heavyweight 360gsm fleece hoodie with the Eka Research logo embroidered on the front. Kangaroo pocket, ribbed cuffs. Made in Nepal.",
    variants: [
      { name: "Size", options: ["S", "M", "L", "XL"] },
      { name: "Colour", options: ["Black", "Charcoal", "Navy Blue"] },
    ],
    inStock: true,
    digital: false,
    gradient: "linear-gradient(135deg, #111827 0%, #0a0d22 100%)",
  },
  {
    id: "observation-cap",
    slug: "observation-cap",
    name: "Observation Cap",
    tagline: "Block the streetlights",
    category: "apparel",
    priceNpr: 800,
    description:
      "Six-panel unstructured cap with an embroidered crescent-and-star mark on the front. Adjustable strap. One size fits most.",
    variants: [
      { name: "Colour", options: ["Black", "Navy Blue"] },
    ],
    badge: "New",
    inStock: true,
    digital: false,
    gradient: "linear-gradient(135deg, #0d1a2e 0%, #080c18 100%)",
  },
  {
    id: "nepal-sky-map",
    slug: "nepal-sky-map",
    name: "Nepal Sky Map (A2 Poster)",
    tagline: "Your sky, calibrated for Nepal",
    category: "educational",
    priceNpr: 650,
    description:
      "A2 (420×594 mm) star chart printed for Kathmandu latitude (27.7°N). Includes constellation lines, deep-sky objects visible from Nepal, and seasonal guides. Printed on 200gsm matte art paper.",
    inStock: true,
    digital: false,
    gradient: "linear-gradient(135deg, #0f0528 0%, #080c18 100%)",
  },
  {
    id: "stargazing-guide",
    slug: "stargazing-guide",
    name: "Beginner's Stargazing Guide",
    tagline: "Start from zero, reach the stars",
    category: "educational",
    priceNpr: 450,
    description:
      "A 64-page printed guide to naked-eye astronomy from Nepal. Covers constellations visible each season, how to read a star chart, light pollution, and citizen science projects you can join.",
    badge: "Best seller",
    inStock: true,
    digital: false,
    gradient: "linear-gradient(135deg, #1a0a30 0%, #080c18 100%)",
  },
  {
    id: "meteor-field-journal",
    slug: "meteor-field-journal",
    name: "Meteor Science Field Journal",
    tagline: "Log every streak",
    category: "educational",
    priceNpr: 350,
    description:
      "A5 softcover journal with structured pages for logging meteor observations — time, azimuth, altitude, brightness, colour, and notes. 120 pages. Includes a quick-reference meteor magnitude chart.",
    inStock: true,
    digital: false,
    gradient: "linear-gradient(135deg, #0a1a1a 0%, #080c18 100%)",
  },
  {
    id: "meteor-watch-kit",
    slug: "meteor-watch-kit",
    name: "Meteor Watch Starter Kit",
    tagline: "Everything you need for your first watch",
    category: "kits",
    priceNpr: 3500,
    description:
      "A curated bundle for your first meteor watch session — hand-picked by Eka's research team. Everything fits in the included drawstring bag.",
    includes: [
      "Nepal Sky Map (A2 Poster)",
      "Meteor Science Field Journal",
      "Red-light torch (preserves night vision)",
      "Observation checklist card",
      "Drawstring carry bag",
    ],
    badge: "Bundle",
    inStock: true,
    digital: false,
    gradient: "linear-gradient(135deg, #0a2020 0%, #080c18 100%)",
  },
  {
    id: "digital-logbook",
    slug: "digital-logbook",
    name: "Digital Observation Logbook",
    tagline: "Structured logging, anywhere",
    category: "digital",
    priceNpr: 299,
    description:
      "A downloadable PDF logbook (A4, fillable) for recording meteor, planetary, and deep-sky observations. Includes 60 structured log sheets, a session summary template, and a yearly progress tracker. Works with any PDF reader.",
    badge: "Digital download",
    inStock: true,
    digital: true,
    gradient: "linear-gradient(135deg, #0a2010 0%, #080c18 100%)",
  },
];
