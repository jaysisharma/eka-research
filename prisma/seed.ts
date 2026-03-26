/**
 * Run: npx tsx prisma/seed.ts
 * Creates a default admin account and seeds store products for development.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const libsqlUrl = url.startsWith("file:") ? url : `file:${url}`;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = new PrismaClient({ adapter: new PrismaLibSql({ url: libsqlUrl }) } as any);

async function main() {
  const existing = await db.user.findUnique({ where: { email: "admin@ekaresearch.org" } });

  if (!existing) {
    const hashed = await bcrypt.hash("admin1234", 12);
    const admin = await db.user.create({
      data: {
        name: "Eka Admin",
        email: "admin@ekaresearch.org",
        password: hashed,
        role: "ADMIN",
      },
    });
    console.log(`✓ Admin created: ${admin.email}`);
    console.log("  Password: admin1234  ← change this before going live");
  } else {
    console.log("Admin already exists — skipping admin seed.");
  }

  // Seed default store products if none exist
  const productCount = await db.storeProduct.count();
  if (productCount === 0) {
    const products = [
      {
        slug: "eka-classic-tee",
        name: "Eka Research Classic Tee",
        tagline: "Wear the mission",
        category: "apparel",
        priceNpr: 1200,
        description: "100% cotton heavyweight tee in black with the Eka Research wordmark embroidered on the chest. Printed on ethically sourced fabric, made in Nepal.",
        variants: JSON.stringify([{ name: "Size", options: ["S", "M", "L", "XL", "XXL"] }, { name: "Colour", options: ["Black", "Navy Blue"] }]),
        badge: "Popular",
        inStock: true,
        digital: false,
        gradient: "linear-gradient(135deg, #1a2060 0%, #0a0d22 100%)",
      },
      {
        slug: "eka-hoodie",
        name: "Eka Research Hoodie",
        tagline: "For late-night observation sessions",
        category: "apparel",
        priceNpr: 2500,
        description: "Heavyweight 360gsm fleece hoodie with the Eka Research logo embroidered on the front. Kangaroo pocket, ribbed cuffs. Made in Nepal.",
        variants: JSON.stringify([{ name: "Size", options: ["S", "M", "L", "XL"] }, { name: "Colour", options: ["Black", "Charcoal", "Navy Blue"] }]),
        inStock: true,
        digital: false,
        gradient: "linear-gradient(135deg, #111827 0%, #0a0d22 100%)",
      },
      {
        slug: "observation-cap",
        name: "Observation Cap",
        tagline: "Block the streetlights",
        category: "apparel",
        priceNpr: 800,
        description: "Six-panel unstructured cap with an embroidered crescent-and-star mark on the front. Adjustable strap. One size fits most.",
        variants: JSON.stringify([{ name: "Colour", options: ["Black", "Navy Blue"] }]),
        badge: "New",
        inStock: true,
        digital: false,
        gradient: "linear-gradient(135deg, #0d1a2e 0%, #080c18 100%)",
      },
      {
        slug: "nepal-sky-map",
        name: "Nepal Sky Map (A2 Poster)",
        tagline: "Your sky, calibrated for Nepal",
        category: "educational",
        priceNpr: 650,
        description: "A2 (420×594 mm) star chart printed for Kathmandu latitude (27.7°N). Includes constellation lines, deep-sky objects visible from Nepal, and seasonal guides. Printed on 200gsm matte art paper.",
        inStock: true,
        digital: false,
        gradient: "linear-gradient(135deg, #0f0528 0%, #080c18 100%)",
      },
      {
        slug: "stargazing-guide",
        name: "Beginner's Stargazing Guide",
        tagline: "Start from zero, reach the stars",
        category: "educational",
        priceNpr: 450,
        description: "A 64-page printed guide to naked-eye astronomy from Nepal. Covers constellations visible each season, how to read a star chart, light pollution, and citizen science projects you can join.",
        badge: "Best seller",
        inStock: true,
        digital: false,
        gradient: "linear-gradient(135deg, #1a0a30 0%, #080c18 100%)",
      },
      {
        slug: "meteor-field-journal",
        name: "Meteor Science Field Journal",
        tagline: "Log every streak",
        category: "educational",
        priceNpr: 350,
        description: "A5 softcover journal with structured pages for logging meteor observations — time, azimuth, altitude, brightness, colour, and notes. 120 pages. Includes a quick-reference meteor magnitude chart.",
        inStock: true,
        digital: false,
        gradient: "linear-gradient(135deg, #0a1a1a 0%, #080c18 100%)",
      },
      {
        slug: "meteor-watch-kit",
        name: "Meteor Watch Starter Kit",
        tagline: "Everything you need for your first watch",
        category: "kits",
        priceNpr: 3500,
        description: "A curated bundle for your first meteor watch session — hand-picked by Eka's research team. Everything fits in the included drawstring bag.",
        includes: JSON.stringify(["Nepal Sky Map (A2 Poster)", "Meteor Science Field Journal", "Red-light torch (preserves night vision)", "Observation checklist card", "Drawstring carry bag"]),
        badge: "Bundle",
        inStock: true,
        digital: false,
        gradient: "linear-gradient(135deg, #0a2020 0%, #080c18 100%)",
      },
      {
        slug: "digital-logbook",
        name: "Digital Observation Logbook",
        tagline: "Structured logging, anywhere",
        category: "digital",
        priceNpr: 299,
        description: "A downloadable PDF logbook (A4, fillable) for recording meteor, planetary, and deep-sky observations. Includes 60 structured log sheets, a session summary template, and a yearly progress tracker.",
        badge: "Digital download",
        inStock: true,
        digital: true,
        gradient: "linear-gradient(135deg, #0a2010 0%, #080c18 100%)",
      },
    ];

    for (const p of products) {
      await db.storeProduct.create({ data: p });
    }
    console.log(`✓ Seeded ${products.length} store products`);
  } else {
    console.log(`  Store already has ${productCount} products — skipping product seed.`);
  }

  // Seed news posts
  const newsCount = await db.newsPost.count();
  if (newsCount === 0) {
    const newsPosts = [
      { slug: "meteor-paper-mnras-2024", title: "Eka Research publishes first paper in Monthly Notices of the Royal Astronomical Society", excerpt: "Our All Sky Camera network study — documenting 3,847 meteors and 89 precise orbital solutions in its first year — has been accepted and published in MNRAS, one of the world's leading astronomy journals.", category: "publication", date: "2024-09-15", imageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1200&q=80", href: "/articles/meteor-network-nepal-2024", featured: true, published: true },
      { slug: "tribhuvan-partnership-2024", title: "Formal partnership signed with Tribhuvan University Physics Department", excerpt: "Eka Research and the TU Physics Department have formalised a research collaboration agreement, opening pathways for joint publications, shared instrumentation access, and student placements.", category: "announcement", date: "2024-07-03", imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80", href: "/news/tribhuvan-partnership-2024", featured: false, published: true },
      { slug: "geomagnetic-storm-paper-2024", title: "New paper: ionospheric response to the May 2024 geomagnetic superstorm over South Asia", excerpt: "Using our ground-based magnetometer array and dual-frequency GPS data, we've characterised the strongest geomagnetic storm in two decades as it passed over Nepal and northern India.", category: "publication", date: "2024-11-03", imageUrl: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=900&q=80", href: "/articles/geomagnetic-south-asia-2024", featured: false, published: true },
      { slug: "100th-member-2023", title: "Eka Research reaches 100 members — mentoring programme launches", excerpt: "We're proud to welcome our 100th member. To mark the milestone, we've launched our formal mentoring programme — matching students with researchers across all six of our disciplines.", category: "milestone", date: "2023-10-14", imageUrl: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?auto=format&fit=crop&w=900&q=80", href: "/news/100th-member-mentoring-launch", featured: false, published: true },
      { slug: "stratonepal-paper-2023", title: "StratoNepal-01 findings published in Atmospheric Measurement Techniques", excerpt: "Our stratospheric balloon mission results — including temperature profiles, ozone data, and cosmic ray counts from 28 km above the Himalayas — are now open access.", category: "publication", date: "2023-06-22", imageUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=80", href: "/articles/stratonepal-01-2023", featured: false, published: true },
      { slug: "allsky-network-live-2022", title: "All Sky Camera network goes live — Nepal's first continuous meteor monitoring system", excerpt: "After two years of development and field testing, the five-station All Sky Camera network is now operational. The cameras run 24/7, automatically detecting and archiving every meteor bright enough to record.", category: "milestone", date: "2022-03-01", imageUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=900&q=80", href: "/news/allsky-network-live-2022", featured: false, published: true },
      { slug: "eclipse-expedition-announced-2024", title: "Eclipse Expedition 2027 announced — targeting 500 students across 15 districts", excerpt: "We're planning Nepal's first coordinated total solar eclipse observation campaign for August 2027. Applications for school partnerships and volunteer coordinators open next quarter.", category: "event", date: "2024-12-01", imageUrl: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=900&q=80", href: "/projects/eclipse-expedition-2027", featured: false, published: true },
      { slug: "fireball-kathmandu-2023", title: "Kathmandu fireball spectroscopy paper accepted — chondritic composition confirmed", excerpt: "A magnitude −7 fireball captured on 14 March 2023 by three Eka cameras has been analysed via diffraction-grating spectroscopy. Sodium, magnesium, and iron lines confirm a chondritic parent body.", category: "publication", date: "2023-08-11", imageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=900&q=80", href: "/articles/fireball-spectroscopy-2023", featured: false, published: true },
    ];
    for (const n of newsPosts) await db.newsPost.create({ data: n });
    console.log(`✓ Seeded ${newsPosts.length} news posts`);
  } else {
    console.log(`  News already has ${newsCount} posts — skipping.`);
  }

  // Seed research articles
  const articleCount = await db.researchArticle.count();
  if (articleCount === 0) {
    const articles = [
      { title: "Establishing a Multi-Station Meteor Detection Network in the Himalayas: Methodology and First Results", authors: JSON.stringify(["A. Sharma", "P. Thapa", "R. Adhikari", "M. Karki", "T. Shrestha"]), ekaAuthors: JSON.stringify(["A. Sharma", "P. Thapa", "R. Adhikari"]), journal: "Monthly Notices of the Royal Astronomical Society", year: 2024, date: "2024-09-15", type: "journal", disciplines: JSON.stringify(["Meteor Science", "Instrumentation"]), abstract: "We present the design, deployment, and early results of a five-station All Sky Camera network operated by Eka Research across Nepal's mid-hill region. During its first operational year the network recorded 3,847 meteors and triangulated 214 multi-station events, yielding precise orbital solutions for 89 sporadic meteors and members of four established streams.", imageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1200&q=80", doi: "10.1093/mnras/stae2241", featured: true, published: true },
      { title: "Ionospheric Response to the May 2024 Geomagnetic Storm over South Asia", authors: JSON.stringify(["M. Karki", "A. Sharma", "S. Bajracharya"]), ekaAuthors: JSON.stringify(["M. Karki", "A. Sharma"]), journal: "Journal of Geophysical Research: Space Physics", year: 2024, date: "2024-11-03", type: "journal", disciplines: JSON.stringify(["Space Weather", "Atmospheric Physics"]), abstract: "Using dual-frequency GPS receivers and Eka's ground-based magnetometer array, we characterise the ionospheric total electron content (TEC) response to the extreme geomagnetic storm of 10–12 May 2024 — the strongest event in two decades — over Nepal and northern India.", imageUrl: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=800&q=80", doi: "10.1029/2024JA032917", featured: false, published: true },
      { title: "StratoNepal-01: Atmospheric and Cosmic Ray Measurements from a High-Altitude Balloon at 28 km over the Central Himalayas", authors: JSON.stringify(["P. Thapa", "R. Adhikari", "A. Sharma", "K. Pandey"]), ekaAuthors: JSON.stringify(["P. Thapa", "R. Adhikari", "A. Sharma"]), journal: "Atmospheric Measurement Techniques", year: 2023, date: "2023-06-22", type: "journal", disciplines: JSON.stringify(["Atmospheric Physics", "Instrumentation"]), abstract: "We describe the instrument package, flight profile, and primary data products of the StratoNepal-01 mission — the first scientific stratospheric balloon launched from Nepali territory. The payload recorded temperature, pressure, ozone concentration, and Geiger-Müller counts from ground to burst altitude.", imageUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80", doi: "10.5194/amt-16-3041-2023", arxiv: "2302.14821", featured: false, published: true },
      { title: "Optical Spectroscopy of a Bright Fireball Detected over the Kathmandu Valley", authors: JSON.stringify(["R. Adhikari", "A. Sharma", "T. Shrestha"]), ekaAuthors: JSON.stringify(["R. Adhikari", "A. Sharma", "T. Shrestha"]), journal: "Meteoritics & Planetary Science (Conference Supplement)", year: 2023, date: "2023-08-11", type: "conference", disciplines: JSON.stringify(["Meteor Science"]), abstract: "A magnitude −7 fireball recorded simultaneously by three Eka cameras on 14 March 2023 enabled spectroscopic analysis using a diffraction grating attached to one station. We identify sodium, magnesium, and iron emission lines consistent with a chondritic composition.", imageUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=80", arxiv: "2308.05612", featured: false, published: true },
      { title: "Barriers and Opportunities for Astronomy Education in Secondary Schools across Nepal: A Survey of 320 Students and 45 Teachers", authors: JSON.stringify(["S. Bajracharya", "A. Sharma", "L. Gurung"]), ekaAuthors: JSON.stringify(["S. Bajracharya", "A. Sharma"]), journal: "arXiv (Education)", year: 2022, date: "2022-11-07", type: "preprint", disciplines: JSON.stringify(["Science Education"]), abstract: "We surveyed 320 students (Class 9–12) and 45 physics teachers across five provinces to assess the state of astronomy education in Nepali secondary schools. Identified barriers include limited access to equipment, no dedicated astronomy curriculum, and a lack of trained educators.", imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80", arxiv: "2211.03847", featured: false, published: true },
      { title: "A Photometric Survey of Long-Period Variable Stars Visible from High-Altitude Sites in Nepal", authors: JSON.stringify(["T. Shrestha", "P. Thapa", "A. Sharma"]), ekaAuthors: JSON.stringify(["T. Shrestha", "P. Thapa", "A. Sharma"]), journal: "Publications of the Astronomical Society of the Pacific", year: 2022, date: "2022-03-19", type: "journal", disciplines: JSON.stringify(["Observational Astronomy", "Astrophysics"]), abstract: "We present V-band light curves of 47 long-period variable stars monitored over two seasons from Eka's Nagarkot observation site at 2,175 m altitude. Period solutions are derived for 38 stars, of which 6 have no previously published periods in the AAVSO or GCVS catalogues.", imageUrl: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?auto=format&fit=crop&w=800&q=80", doi: "10.1088/1538-3873/ac5f2a", featured: false, published: true },
    ];
    for (const a of articles) await db.researchArticle.create({ data: a });
    console.log(`✓ Seeded ${articles.length} research articles`);
  } else {
    console.log(`  Research already has ${articleCount} articles — skipping.`);
  }

  // Seed dev user (you)
  let devUser = await db.user.findUnique({ where: { email: "jaysi@ekaresearch.org" } });
  if (!devUser) {
    const hashed = await bcrypt.hash("password123", 12);
    devUser = await db.user.create({
      data: {
        name: "Jaysi Sharma",
        email: "jaysi@ekaresearch.org",
        password: hashed,
        role: "FREE_USER",
        level: "Bachelor's student",
        interest: "Meteor science & detection",
      },
    });
    console.log(`✓ Dev user created: ${devUser.email}  (password: password123)`);
  } else {
    console.log("  Dev user already exists — skipping.");
  }

  // Seed events (always wipe & re-seed so slugs are current)
  await db.eventRegistration.deleteMany();
  await db.event.deleteMany();
  const eventCount = 0;
  if (eventCount === 0) {
    const eventDefs = [
      {
        slug: "lyrid-meteor-watch-2026",
        title: "Lyrid Meteor Watch Night",
        description: "Join us for a guided naked-eye observation of the Lyrid meteor shower from a dark-sky site outside Kathmandu. Open to all levels — telescopes and hot tea provided.",
        type: "observation",
        date: "2026-04-22",
        time: "8:00 PM NPT",
        location: "Nagarkot, Bhaktapur",
        locationDetail: "Dark Sky Site",
        seats: 40,
        seatsLeft: 12,
        href: "/events/lyrid-meteor-watch-2026",
        registrationHref: "/events/lyrid-meteor-watch-2026/register",
        published: true,
      },
      {
        slug: "intro-astronomy-workshop-2026",
        title: "Introduction to Astronomy Workshop",
        description: "A one-day hands-on workshop covering the basics of naked-eye observation, star maps, telescope operation, and how to get involved in citizen science from Nepal.",
        type: "workshop",
        date: "2026-05-10",
        time: "10:00 AM NPT",
        location: "Kathmandu",
        locationDetail: "Eka Research Centre",
        seats: 25,
        seatsLeft: 9,
        href: "/events/intro-astronomy-workshop-2026",
        registrationHref: "/events/intro-astronomy-workshop-2026/register",
        published: true,
      },
      {
        slug: "space-weather-lecture-2026",
        title: "Public Lecture: Space Weather & You",
        description: "How solar storms affect satellites, power grids, and GPS — and what Nepali researchers are doing to monitor them. Free entry, open to the public.",
        type: "lecture",
        date: "2026-05-28",
        time: "5:30 PM NPT",
        location: "Kathmandu",
        locationDetail: "Tribhuvan University, Physics Dept.",
        seats: null,
        seatsLeft: null,
        href: "/events/space-weather-lecture-2026",
        registrationHref: "/events/space-weather-lecture-2026/register",
        published: true,
      },
      {
        slug: "geminid-camp-2026",
        title: "Geminid Meteor Watch Camp",
        description: "An overnight meteor observation camp at a high-altitude dark-sky site. Includes guided sessions on meteor counting methodology and live data logging using Eka's citizen science portal.",
        type: "observation",
        date: "2026-12-13",
        time: "7:00 PM NPT",
        location: "Kakani, Nuwakot",
        locationDetail: "High-Altitude Dark Sky Site",
        seats: 30,
        seatsLeft: 30,
        href: "/events/geminid-camp-2026",
        registrationHref: "/events/geminid-camp-2026/register",
        published: true,
      },
      {
        slug: "nepal-space-symposium-2026",
        title: "Nepal Space Science Symposium 2026",
        description: "Eka Research's annual gathering of students, researchers, and educators working in space science across Nepal. Talks, posters, and networking across two days.",
        type: "conference",
        date: "2026-09-05",
        time: "9:00 AM NPT",
        location: "Kathmandu",
        locationDetail: "Hotel Yak & Yeti, Conference Hall",
        seats: 200,
        seatsLeft: 140,
        href: "/events/nepal-space-symposium-2026",
        registrationHref: "/events/nepal-space-symposium-2026/register",
        published: true,
      },
    ];

    const createdEvents: { id: string; slug: string | null }[] = [];
    for (const ev of eventDefs) {
      const created = await db.event.create({ data: ev });
      createdEvents.push({ id: created.id, slug: created.slug });
    }
    console.log(`✓ Seeded ${createdEvents.length} events`);

    // Seed registrations — attach dev user to first two events
    const lyrid = createdEvents.find(e => e.slug === "lyrid-meteor-watch-2026");
    const workshop = createdEvents.find(e => e.slug === "intro-astronomy-workshop-2026");
    const symposium = createdEvents.find(e => e.slug === "nepal-space-symposium-2026");

    if (lyrid && devUser) {
      await db.eventRegistration.createMany({
        data: [
          { eventId: lyrid.id, userId: devUser.id, name: devUser.name, email: devUser.email, phone: "+977-9812345678", message: "Really excited to see the Lyrids from a dark site!", status: "confirmed" },
          { eventId: lyrid.id, name: "Priya Thapa", email: "priya.thapa@example.com", phone: "+977-9841000001", status: "confirmed" },
          { eventId: lyrid.id, name: "Rajan Adhikari", email: "rajan.adhikari@example.com", status: "confirmed" },
          { eventId: lyrid.id, name: "Sita Gurung", email: "sita.gurung@example.com", phone: "+977-9856000002", status: "confirmed" },
          { eventId: lyrid.id, name: "Bikash Karki", email: "bikash.k@example.com", status: "waitlisted" },
        ],
      });
      console.log("✓ Seeded 5 registrations for Lyrid Meteor Watch");
    }

    if (workshop) {
      await db.eventRegistration.createMany({
        data: [
          { eventId: workshop.id, userId: devUser?.id, name: devUser?.name ?? "Jaysi Sharma", email: devUser?.email ?? "jaysi@ekaresearch.org", status: "confirmed" },
          { eventId: workshop.id, name: "Anisha Bajracharya", email: "anisha.b@example.com", status: "confirmed" },
          { eventId: workshop.id, name: "Dipesh Maharjan", email: "dipesh.m@example.com", phone: "+977-9823000003", status: "confirmed" },
        ],
      });
      console.log("✓ Seeded 3 registrations for Astronomy Workshop");
    }

    if (symposium) {
      await db.eventRegistration.createMany({
        data: [
          { eventId: symposium.id, name: "Rohan Shrestha", email: "rohan.s@example.com", status: "confirmed" },
          { eventId: symposium.id, name: "Manisha Pandey", email: "manisha.p@example.com", status: "confirmed" },
        ],
      });
      console.log("✓ Seeded 2 registrations for Symposium");
    }
  } else {
    console.log(`  Events already has ${eventCount} records — skipping.`);
  }
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
