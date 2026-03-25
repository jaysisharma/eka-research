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
    "A science research and outreach organization based in Kathmandu, Nepal — making space science accessible to every curious mind.",
  location: "Kathmandu, Nepal",
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
        description: "Workshops and curriculum support for class 9–bachelor level",
      },
      {
        label: "Researchers",
        href: "/services/researchers",
        description: "Exclusive resources for masters & PhD students",
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
      { label: "Join Us", href: "/opportunities/join" },
      { label: "Vacancy", href: "/opportunities/vacancy" },
      { label: "Mentoring Program", href: "/opportunities/mentoring" },
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
};

export const PROJECTS: Project[] = [
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
  },
  {
    id: "eclipse-expedition-2027",
    title: "Eclipse Expedition 2027",
    description:
      "Planning Nepal's first coordinated solar eclipse observation campaign — engaging 500+ students across 15 districts with loaned eclipse glasses and live data collection.",
    status: "upcoming",
    period: "2027",
    tags: ["Outreach", "Solar", "Education"],
    image:
      "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=800&q=80",
    href: "/projects/eclipse-expedition-2027",
    featured: false,
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
      "We surveyed 320 students (Class 9–12) and 45 physics teachers across five provinces to assess the state of astronomy education in Nepali secondary schools. Identified barriers include limited access to equipment, no dedicated astronomy curriculum, and a lack of trained educators.",
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
    id: "astrophysics",
    icon: "Atom",
    image:
      "https://images.unsplash.com/photo-1543722530-d2c3201371e7?auto=format&fit=crop&w=800&q=80",
    title: "Astrophysics",
    description:
      "Theoretical and computational research into stellar evolution, galactic dynamics, and high-energy astrophysical phenomena.",
    href: "/research#astrophysics",
  },
  {
    id: "science-education",
    icon: "BookOpen",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
    title: "Science Education Research",
    description:
      "Developing evidence-based methods for science communication and astronomy outreach tailored to the Nepali curriculum.",
    href: "/research#science-education",
  },
];
