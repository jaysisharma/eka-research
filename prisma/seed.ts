/**
 * Run: npx tsx prisma/seed.ts
 * Creates a default admin account and seeds store products for development.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";


const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);
const db = new PrismaClient({ adapter });

async function main() {
  const existing = await db.user.findUnique({ where: { email: "admin@ekaresearch.org" } });

  if (!existing) {
    const hashed = await bcrypt.hash("admin1234", 12);
    const admin = await db.user.create({
      data: {
        name: "Jack Maa",
        email: "admin@ekaresearch.org",
        password: hashed,
        role: "ADMIN",
        emailVerified: true,
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

  // Seed research articles — always wipe & reseed so new fields are populated
  await db.researchArticle.deleteMany();
  console.log("  Cleared existing research articles.");

  const articles = [
    /* ── 1 · Featured journal paper ─────────────────────────────────── */
    {
      title: "Establishing a Multi-Station Meteor Detection Network in the Himalayas: Methodology and First Results",
      authors: JSON.stringify(["A. Sharma", "P. Thapa", "R. Adhikari", "M. Karki", "T. Shrestha"]),
      ekaAuthors: JSON.stringify(["A. Sharma", "P. Thapa", "R. Adhikari"]),
      internalContributors: JSON.stringify([]),
      journal: "Monthly Notices of the Royal Astronomical Society",
      publicationDate: "2024-09-15",
      publicationStatus: "published",
      year: 2024,
      date: "2024-09-15",
      type: "journal",
      disciplines: JSON.stringify(["Meteor Science", "Instrumentation"]),
      abstract: "We present the design, deployment, and early results of a five-station All Sky Camera network operated by Eka Research across Nepal's mid-hill region. During its first operational year the network recorded 3,847 meteors and triangulated 214 multi-station events, yielding precise orbital solutions for 89 sporadic meteors and members of four established meteor streams. Station separations of 50–120 km enable triangulation of events at 70–130 km altitude. Detection efficiency, astrometric calibration procedures, and data pipeline architecture are described in detail.",
      imageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1200&q=80",
      doi: "10.1093/mnras/stae2241",
      arxiv: "2407.09134",
      featured: true,
      published: true,
      isPremium: false,
      submissionStatus: "approved",
      content: `# Introduction

Nepal's mid-hill region — spanning altitudes of 1,200–2,500 m — presents exceptional conditions for meteor observation: low light pollution, monsoon-free winter skies exceeding 200 clear nights per year, and a geographic latitude of 27–29°N that offers favourable southern ecliptic coverage.

Despite these advantages, no systematic, multi-station meteor monitoring infrastructure existed in South Asia prior to this work. The Eka Research All Sky Camera (ASC) network was established between January 2022 and March 2023 with the goal of filling this gap and providing the first long-baseline meteor orbital dataset from the Himalayas.

## Network Design

### Station Locations

Five stations were selected across a 180 × 120 km footprint:

| Station | Location | Altitude (m) | Horizon limit |
| --- | --- | --- | --- |
| EKA-N01 | Nagarkot, Bhaktapur | 2,175 | 15° |
| EKA-N02 | Dhulikhel, Kavre | 1,585 | 12° |
| EKA-N03 | Tistung, Makwanpur | 1,920 | 18° |
| EKA-N04 | Palpa, Lumbini Province | 1,370 | 10° |
| EKA-N05 | Gorkha | 1,050 | 14° |

Station baselines range from 52 km (EKA-N01 to EKA-N02) to 215 km (EKA-N02 to EKA-N05), providing geometric diversity for triangulation of meteors in the 70–130 km altitude band.

### Camera Specifications

Each station runs a Sony IMX174 sensor behind a 1.55 mm f/1.0 fisheye lens, capturing 170° of sky at 25 fps. Frames are stored as 8-bit grayscale FITS with embedded GPS timestamps accurate to ±2 ms. The detection pipeline runs locally on a Raspberry Pi 5 and uploads candidate events to our central server within 60 seconds of detection.

## Methodology

### Astrometric Calibration

Each camera is calibrated against a catalogue of 2,400 stars derived from Gaia DR3. A sixth-order polynomial plate model is fitted nightly, achieving a median residual of 0.08° across the full field. Calibration is performed automatically at the start of each observing night.

### Triangulation

Multi-station events are matched using a ±5-second time window and correlated angular velocity. Trajectory solutions are computed using the method of *Borovička (1990)*, minimising residuals across all participating stations simultaneously. A minimum of two stations is required; three or more stations are used for the 89 precision orbital solutions in this dataset.

## First-Year Results

### Detection Statistics

During the 12-month reporting period (March 2023 – February 2024), the network operated for a total of **1,847 station-nights** across all five sites, accumulating **4,230 hours** of clear-sky data.

- **3,847** single-station meteor detections
- **214** confirmed multi-station events
- **89** full orbital solutions (three or more stations)
- **12** fireball events (peak magnitude < −3)

The network's sporadic background rate of 6.2 ± 0.8 meteors hr⁻¹ per station (corrected for effective collection area) is consistent with rates reported by European networks at comparable latitudes.

### Orbital Solutions

Of the 89 precision orbits, 61 (69%) are classified as sporadic using the D-criterion of *Southworth & Hawkins (1963)*. The remaining 28 events associate with known streams: Perseids (11), Geminids (8), Leonids (5), and Taurids (4). A full orbit catalogue is provided as an online supplement.

## Discussion

The ASC network demonstrates that high-quality meteor astrometry is achievable from subtropical Himalayan sites despite seasonal monsoon interruption. Annual data loss to cloud cover averages 38% across all stations, concentrated in June–August. Winter months (November–February) deliver the highest duty cycles, exceeding 85% at all stations.

Planned upgrades include deployment of a sixth station in Mustang district (3,710 m altitude) and integration of a spectrograph at EKA-N01 for chemical composition analysis of bright events.

## Conclusion

The Eka Research ASC network is the first long-baseline meteor monitoring system in South Asia. First-year operations confirm robust detection capability, reliable triangulation, and scientifically valid orbital solutions. The data presented here represent the beginning of a long-term Himalayan meteor record that will complement global networks and provide unique coverage of the southern ecliptic.

## References

1. Borovička, J. (1990). The comparison of two methods of determining meteor trajectories from photographs. *Bulletin of the Astronomical Institute of Czechoslovakia*, 41, 391–396.
2. Southworth, R. B., & Hawkins, G. S. (1963). Statistics of meteor streams. *Smithsonian Contributions to Astrophysics*, 7, 261–285.
3. Gaia Collaboration et al. (2023). Gaia Data Release 3. *Astronomy & Astrophysics*, 674, A1.`,
    },

    /* ── 2 · Premium journal paper ───────────────────────────────────── */
    {
      title: "Ionospheric Response to the May 2024 Geomagnetic Storm over South Asia: TEC Enhancements and Post-Storm Depression",
      authors: JSON.stringify(["M. Karki", "A. Sharma", "S. Bajracharya", "D. Poudel"]),
      ekaAuthors: JSON.stringify(["M. Karki", "A. Sharma"]),
      internalContributors: JSON.stringify([]),
      journal: "Journal of Geophysical Research: Space Physics",
      publicationDate: "2024-11-03",
      publicationStatus: "published",
      year: 2024,
      date: "2024-11-03",
      type: "journal",
      disciplines: JSON.stringify(["Space Weather", "Atmospheric Physics"]),
      abstract: "Using dual-frequency GPS receivers and Eka's ground-based magnetometer array, we characterise the ionospheric total electron content (TEC) response to the extreme geomagnetic storm of 10–12 May 2024 — the strongest event in two decades — over Nepal and northern India. Peak TEC enhancement of 42% above quiet-time baseline was recorded at 14:20 UT on 11 May, followed by a 72-hour post-storm depression. Dst reached −412 nT at storm maximum.",
      imageUrl: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=800&q=80",
      doi: "10.1029/2024JA032917",
      featured: false,
      published: true,
      isPremium: true,
      submissionStatus: "approved",
      content: `# Introduction

The geomagnetic storm of 10–12 May 2024 — driven by a sequence of five X-class solar flares and associated coronal mass ejections (CMEs) originating from active region NOAA 13664 — produced the largest Dst excursion (−412 nT) recorded since the Halloween storms of October 2003. The event received global scientific attention, yet ionospheric data from South Asia, and Nepal in particular, remained largely unanalysed.

This paper presents the first detailed account of the storm's ionospheric signature over the Nepal–India corridor using data from Eka Research's ground-based dual-frequency GPS receivers and fluxgate magnetometer array.

## Instrumentation

### GPS Receiver Network

Eka operates three dual-frequency GPS receivers (Trimble NetR9) at:
- Kathmandu (27.7°N, 85.3°E, 1,350 m)
- Pokhara (28.2°N, 83.9°E, 820 m)
- Biratnagar (26.5°N, 87.3°E, 72 m)

TEC is derived from the carrier-phase difference (L1–L2) and converted to vertical TEC (vTEC) using a mapping function with a thin-shell ionosphere assumed at 350 km altitude.

### Magnetometer Array

Two fluxgate magnetometers (FGM-3D, 0.1 nT resolution) are co-located with the Kathmandu and Pokhara GPS stations. Horizontal component (H) data are sampled at 1 Hz and averaged to 1-minute cadence for comparison with Dst and Kp indices.

## Storm Timeline

The geomagnetic storm evolved in three distinct phases over the observing window:

**Initial phase (10 May, 06:00–18:00 UT):** Sudden storm commencement (SSC) at 06:23 UT as the first CME arrived. Dst rose to +52 nT (positive bay), indicating compression of the dayside magnetosphere.

**Main phase (10 May, 18:00 UT – 11 May, 20:00 UT):** Rapid Dst decline beginning at 18:30 UT on 10 May, reaching −412 nT at 03:15 UT on 11 May. Kp reached 9 (maximum) for six consecutive 3-hour intervals.

**Recovery phase (11 May, 20:00 UT – 13 May):** Exponential Dst recovery with a time constant of approximately 18 hours, consistent with ring current decay via charge exchange.

## TEC Results

### Positive Storm Phase

vTEC at Kathmandu increased by 42% above the 27-day running median between 11:00 and 16:00 UT on 11 May. The enhancement is attributed to prompt penetration electric fields (PPEF) driving equatorial plasma fountains that elevated the ionosphere over low-latitude South Asia.

### Post-Storm Depression

A vTEC depletion of 28–35% relative to quiet-time background persisted from 12–14 May, consistent with composition changes (elevated N₂/O ratio) transported from high latitudes during the storm's main phase.

## Discussion

The magnitude of the positive TEC phase over Nepal (42%) exceeds values reported at comparable latitudes in the Atlantic and Pacific sectors for the same storm, suggesting a longitudinal dependence that may relate to the proximity of the magnetic equator dip angle over South Asia.

## Conclusion

The May 2024 extreme geomagnetic storm produced significant ionospheric disturbances over Nepal detectable with ground-based GPS. The Eka magnetometer array captured the full storm evolution and demonstrates the value of continuous monitoring infrastructure in a region historically underserved by space weather networks.

## References

1. Gonzalez, W. D., et al. (1994). What is a geomagnetic storm? *Journal of Geophysical Research*, 99(A4), 5771–5792.
2. Tsurutani, B. T., et al. (2004). The extreme magnetic storm of 1–2 September 1859. *Journal of Geophysical Research*, 108(A7).`,
    },

    /* ── 3 · Open access journal paper ──────────────────────────────── */
    {
      title: "StratoNepal-01: Atmospheric and Cosmic Ray Measurements from a Recoverable High-Altitude Balloon at 28 km over the Central Himalayas",
      authors: JSON.stringify(["P. Thapa", "R. Adhikari", "A. Sharma", "K. Pandey", "B. Rana"]),
      ekaAuthors: JSON.stringify(["P. Thapa", "R. Adhikari", "A. Sharma"]),
      internalContributors: JSON.stringify([]),
      journal: "Atmospheric Measurement Techniques",
      publicationDate: "2023-06-22",
      publicationStatus: "published",
      year: 2023,
      date: "2023-06-22",
      type: "journal",
      disciplines: JSON.stringify(["Atmospheric Physics", "Instrumentation"]),
      abstract: "We describe the instrument package, flight profile, and primary data products of the StratoNepal-01 mission — the first scientific stratospheric balloon launched and recovered from Nepali territory. The payload reached a burst altitude of 28.4 km above mean sea level over the central Himalayas, recording vertical profiles of temperature, pressure, relative humidity, ozone partial pressure, and Geiger-Müller counts at 1-second cadence throughout ascent and descent. Ozone column measurements agree with OMI satellite retrievals to within 4.2%.",
      imageUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80",
      doi: "10.5194/amt-16-3041-2023",
      arxiv: "2302.14821",
      externalUrl: "https://amt.copernicus.org/articles/16/3041/2023/",
      featured: false,
      published: true,
      isPremium: false,
      submissionStatus: "approved",
      content: `# Introduction

High-altitude balloon (HAB) soundings provide a cost-effective means of measuring atmospheric parameters across the troposphere and lower stratosphere. While HAB campaigns are common in Europe and North America, the Himalayan region presents both unique opportunities — extreme altitude, low background radiation, pristine stratospheric air — and operational challenges including high winds, complex terrain, and limited recovery infrastructure.

StratoNepal-01 was designed and executed entirely by Eka Research members, with the primary goal of demonstrating that stratospheric science is achievable from Nepal and of establishing baseline atmospheric datasets for future missions.

## Payload Description

The flight payload (total mass 1.85 kg including the balloon attachment) carried the following instruments:

- **Temperature/pressure/humidity:** Sensirion SHT35 and BMP390 sensors sampled at 1 Hz
- **Ozone:** Electrochemical Concentration Cell (ECC) ozonesonde, 0.5 Hz
- **Cosmic rays:** Two Geiger-Müller tubes (LND 712) in anticoincidence, 1 Hz
- **GPS:** u-blox M9N, 10 Hz position and velocity
- **Telemetry:** 433 MHz LoRa transceiver with 500 mW output, 1-minute position beacons
- **Recovery:** Dual parachute system, radar reflector, SMS beacon (GSM 4G)

Total power draw: 2.8 W, supplied by six lithium AA cells (estimated flight duration: 5 hours).

## Flight Summary

The balloon was launched from Pokhara Airport (823 m AMSL) at 05:30 NPT on 18 March 2023 under calm pre-dawn conditions. The 1,500 g latex balloon achieved an average ascent rate of 5.2 m s⁻¹, reaching burst altitude of **28,420 m** at 08:17 NPT. The payload descended under the primary parachute and was recovered in a wheat field 43 km southeast of the launch site approximately 2.5 hours after burst.

All instruments operated nominally throughout the flight. Total data collected: 11,800 seconds of 1 Hz observations.

## Results

### Temperature Profile

The tropopause was identified at 16.8 km altitude by the temperature minimum of −72.4°C, in good agreement with ERA5 reanalysis for the same time and location (−71.9°C, Δ = 0.5°C). The stratospheric lapse rate of +2.1°C km⁻¹ above the tropopause is consistent with climatological means for March over Nepal.

### Ozone Profile

Total ozone column derived from ECC integration: **278 Dobson units (DU)**, compared to OMI satellite retrieval of **267 DU** for the same overpass — a relative difference of 4.2%. The ozone layer peak at 24–26 km altitude with a maximum mixing ratio of 8.4 ppm is consistent with Southern Asian climatology.

### Cosmic Ray Flux

Geiger-Müller count rates increase from sea level baseline (~12 counts min⁻¹) to a maximum of **228 counts min⁻¹** at 19.5 km (the Regener-Pfotzer maximum), then decrease at higher altitudes as atmospheric shielding is replaced by the increasingly thin absorber. These values agree with published Pfotzer maximum intensities at low geomagnetic latitudes.

## Discussion

The mission confirms that stratospheric sounding from Nepal is operationally feasible with modest resources. Key lessons include the importance of selecting low-wind launch windows in pre-monsoon (February–May) or post-monsoon (October–November) seasons and the need for multi-frequency radio tracking in terrain with deep valleys.

## Conclusion

StratoNepal-01 successfully returned the first stratospheric atmospheric profile from Nepali territory, providing ozone, temperature, and cosmic ray data consistent with satellite and global climatological records. The mission demonstrates the viability of an annual Himalayan balloon science programme and establishes operational procedures for future missions with expanded instrument packages.

## References

1. Angerer, B., et al. (2017). Knowledge gained from 20 years of stratospheric ozone ozonesonde measurements at Hohenpeissenberg. *Atmospheric Chemistry and Physics*, 17, 15097–15120.
2. Regener, E., & Pfotzer, G. (1935). Intensity of the cosmic ultra-radiation in the stratosphere with the tube-counter. *Nature*, 136, 718–719.`,
    },

    /* ── 4 · Conference paper ────────────────────────────────────────── */
    {
      title: "Optical Spectroscopy of a Bright Fireball Detected over the Kathmandu Valley: Chondritic Composition and Ablation Modelling",
      authors: JSON.stringify(["R. Adhikari", "A. Sharma", "T. Shrestha", "J. Borovička"]),
      ekaAuthors: JSON.stringify(["R. Adhikari", "A. Sharma", "T. Shrestha"]),
      internalContributors: JSON.stringify([]),
      journal: "Meteoritics & Planetary Science, 58th Annual Meeting",
      publicationDate: "2023-08-11",
      publicationStatus: "published",
      year: 2023,
      date: "2023-08-11",
      type: "conference",
      disciplines: JSON.stringify(["Meteor Science", "Planetary Science"]),
      abstract: "A magnitude −7 fireball recorded simultaneously by three Eka cameras on 14 March 2023 at 19:42:38 UT enabled spectroscopic analysis using a 600 l mm⁻¹ diffraction grating mounted at station EKA-N01. We identify sodium (589 nm), magnesium (518 nm), and iron (527 nm, 532 nm) emission lines, together with a weak calcium feature at 423 nm. Line intensity ratios yield elemental abundances consistent with an ordinary chondrite parent body. Ablation modelling from the simultaneously recorded light curve and deceleration indicates a meteoroid bulk density of 3,200 ± 400 kg m⁻³.",
      imageUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=80",
      arxiv: "2308.05612",
      featured: false,
      published: true,
      isPremium: false,
      submissionStatus: "approved",
      content: `# Event Description

On 14 March 2023 at 19:42:38 UT, a bright fireball was independently detected by stations EKA-N01 (Nagarkot), EKA-N02 (Dhulikhel), and EKA-N03 (Tistung). The event lasted 4.8 seconds, achieving a peak absolute magnitude of −7.1 ± 0.3 measured by calibrated all-sky photometry.

A 600 lines mm⁻¹ holographic diffraction grating mounted in front of the EKA-N01 lens dispersed the fireball spectrum onto the camera sensor, yielding a dispersion of approximately 12 nm pixel⁻¹ across the 400–750 nm range.

## Spectral Analysis

### Identified Emission Lines

The spectrum was wavelength-calibrated against known Ne-lamp reference spectra taken nightly. After correction for instrument response and atmospheric absorption, the following lines were identified:

| Element | λ (nm) | Identification |
| --- | --- | --- |
| Na I | 589.0 | D-line doublet (blended) |
| Mg I | 518.4 | b-group triplet |
| Fe I | 526.9 | Multiplet 15 |
| Fe I | 532.8 | Multiplet 15 |
| Ca I | 422.7 | Resonance line |
| N II | 648.0 | Atmospheric (reference) |

### Elemental Abundances

Relative elemental abundances were derived using transition probabilities from the NIST Atomic Spectra Database and corrected for excitation temperature estimated at 4,800 ± 300 K from the Mg/Fe line ratio. The resulting Mg/Fe and Na/Fe ratios fall within the CI chondrite range.

## Trajectory and Orbit

Three-station triangulation yields a trajectory with a zenith angle of 28° and a terminal height of 52 km, consistent with complete ablation above the mesosphere. The pre-atmospheric velocity of 18.4 km s⁻¹ and the solved radiant (α = 214°, δ = +12°) place the orbit in the sporadic background with Tisserand parameter T_J = 3.4, suggesting an asteroidal rather than cometary origin.

## Conclusion

This event demonstrates the capability of the Eka network to characterise both the trajectory and chemical composition of bright fireballs, contributing to the global database of Himalayan meteor spectroscopy.`,
    },

    /* ── 5 · Premium preprint ────────────────────────────────────────── */
    {
      title: "Solar Cycle 25 Sunspot Area Measurements from Low-Latitude Nepal: A Ground-Based White-Light Dataset (2021–2024)",
      authors: JSON.stringify(["A. Sharma", "M. Karki", "T. Shrestha"]),
      ekaAuthors: JSON.stringify(["A. Sharma", "M. Karki", "T. Shrestha"]),
      internalContributors: JSON.stringify([]),
      journal: "arXiv: Solar and Stellar Astrophysics",
      publicationDate: "2024-04-09",
      publicationStatus: "accepted",
      year: 2024,
      date: "2024-04-09",
      type: "preprint",
      disciplines: JSON.stringify(["Space Weather", "Observational Astronomy", "Stellar Physics"]),
      abstract: "We present a three-year white-light solar imaging dataset acquired from Eka Research's Nagarkot observatory (27.7°N, 85.5°E) using a 102 mm refractor with a Baader AstroSolar film filter and a ZWO ASI183MM camera. The dataset spans January 2021 to December 2023, covering the rising phase of Solar Cycle 25. Daily sunspot areas are derived using a semi-automated segmentation pipeline and compared against SILSO international sunspot numbers and NOAA/USAF group areas. Our low-latitude site provides viewing geometries complementary to European and North American observatories for high-latitude sunspot groups.",
      imageUrl: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=800&q=80",
      arxiv: "2404.05982",
      featured: false,
      published: true,
      isPremium: true,
      submissionStatus: "approved",
      content: `# Introduction

Solar Cycle 25, which began in December 2019, has exceeded the predictions of the Solar Cycle 25 Prediction Panel, reaching sunspot numbers substantially higher than the Panel's median forecast by mid-2023. Monitoring this cycle from diverse geographic longitudes and latitudes improves coverage of the solar disk throughout the day.

Eka Research began regular white-light solar observations in January 2021, coinciding with the early rising phase of Cycle 25. This paper describes our imaging pipeline, area measurement methodology, and presents the full three-year dataset with comparison to standard reference datasets.

## Instrumentation and Site

### Telescope and Camera

- **Telescope:** William Optics FluoroStar 102 refractor, f/7, 714 mm focal length
- **Filter:** Baader AstroSolar film, OD 5.0 (visual)
- **Camera:** ZWO ASI183MM (20 MP, 2.4 µm pixels), binned 2×2 for observing
- **Plate scale:** 0.67 arcsec pixel⁻¹ (binned)
- **Imaging cadence:** 5-minute sequences when sky transparency > 70%

### Site Conditions

The Nagarkot station operates on a ridge at 2,175 m AMSL with a clear eastern horizon that enables solar observations from sunrise (typically 05:45–06:00 NPT in winter, 05:10–05:30 NPT in summer). The monsoon season (June–September) reduces solar coverage to approximately 15% of possible observing days.

## Data Processing

### Limb Detection and Orientation

Each frame is processed by a Python pipeline that:
1. Fits a circle to the solar limb using a Hough transform
2. Determines the position angle of solar north using the NOAA ephemeris for the time of observation
3. Projects the image to a standardised heliographic coordinate system

### Sunspot Segmentation

Sunspot umbrae and penumbrae are detected using an adaptive threshold set at 80% and 92% of the quiet-sun intensity, respectively. Group assignments follow the McIntosh classification scheme with human verification for each day's final catalogue.

## Results

### Dataset Summary

Over 1,095 possible observing days, we obtained usable data on **742 days** (67.8% duty cycle). The monsoon-season gap accounts for the majority of data loss.

Total sunspot groups observed: **1,847**
Total individual sunspots: **8,423**
Days with zero sunspots: **34** (concentrated in 2021 Q1)

### Comparison with SILSO

Our monthly mean sunspot areas show a Pearson correlation coefficient of r = 0.96 with NOAA/USAF group areas for the same period. Systematic offsets of +3.2% in area measurement are attributed to differences in plate scale calibration and will be corrected in the final journal submission.

## Conclusion

The Eka solar dataset constitutes the first systematic sunspot record from Nepal and demonstrates the feasibility of contributing to the global solar monitoring network from Himalayan sites. Data will be submitted to the Solar Influences Data Analysis Center (SIDC) upon journal acceptance.`,
    },

    /* ── 6 · Education preprint ─────────────────────────────────────── */
    {
      title: "Barriers and Opportunities for Astronomy Education in Secondary Schools across Nepal: A Mixed-Methods Survey",
      authors: JSON.stringify(["S. Bajracharya", "A. Sharma", "L. Gurung", "D. Thapa"]),
      ekaAuthors: JSON.stringify(["S. Bajracharya", "A. Sharma"]),
      internalContributors: JSON.stringify([]),
      journal: "International Journal of Science Education (under review)",
      publicationDate: "2022-11-07",
      publicationStatus: "under_review",
      year: 2022,
      date: "2022-11-07",
      type: "preprint",
      disciplines: JSON.stringify(["Science Education"]),
      abstract: "We surveyed 320 secondary school students and 45 physics teachers across five provinces to assess the current state and perceived value of astronomy education in Nepali schools. Using a mixed-methods design combining Likert-scale questionnaires with 22 semi-structured interviews, we identify four primary barriers: curriculum exclusion, equipment scarcity, teacher training gaps, and assessment pressure. We propose a three-tier intervention model and report early outcomes from a 12-month pilot in 8 schools.",
      imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
      arxiv: "2211.03847",
      featured: false,
      published: true,
      isPremium: false,
      submissionStatus: "approved",
      content: `# Introduction

Nepal's secondary school science curriculum (Grades 9–12) includes a brief astronomy unit within the Physics syllabus, typically covering the solar system, stellar classification, and the scale of the universe. In practice, however, classroom treatment of these topics is minimal. No dedicated astronomy equipment is mandated or provided, and no separate astronomy examination exists within the National Examination Board framework.

This study systematically examines why astronomy education remains marginalised in Nepali schools and what structural and pedagogical changes could improve outcomes.

## Methodology

### Participants

- **Students:** 320 students in Grades 9–12, sampled across 32 schools in five provinces (Bagmati, Gandaki, Lumbini, Koshi, Madhesh)
- **Teachers:** 45 physics teachers from the same schools, with teaching experience ranging from 2 to 24 years

Schools were selected to represent a mix of urban/rural settings and government/private funding models.

### Instruments

**Student questionnaire (40 items):**
- Likert-scale items assessing interest in astronomy, perceived difficulty, and exposure to resources
- Open-ended items on memorable astronomy experiences and career aspirations

**Teacher questionnaire (35 items):**
- Confidence and preparation ratings for each astronomy curriculum topic
- Equipment access and professional development history

**Interviews:** 12 students and 10 teachers participated in 30-minute semi-structured interviews exploring themes that emerged from questionnaire analysis.

## Key Findings

### Barrier 1: Curriculum Exclusion

Only 6.2% of curriculum contact time in Grade 11–12 Physics is allocated to astronomy topics. Teachers report skipping these sections under examination pressure: 78% of surveyed teachers said they "sometimes or always" skip the astronomy unit to focus on examination-weighted mechanics and electricity topics.

### Barrier 2: Equipment Scarcity

89% of schools reported having no telescope or solar filter available. 63% had no planetarium software installed on any school computer. The median travel distance for students to access a telescope was 47 km.

### Barrier 3: Teacher Training

Only 12% of physics teachers reported receiving any pre-service or in-service training specifically on teaching astronomy. 71% expressed low confidence in teaching stellar evolution and cosmology topics.

### Barrier 4: Assessment Pressure

The SLC/SEE examination includes on average 2–3 astronomy marks out of 75 total physics marks (2.7–4%). Teachers rationally allocate preparation time proportional to examination weight.

## Proposed Intervention Model

We propose a three-tier model:

**Tier 1 — Low-cost curriculum enrichment:** Provide free, downloadable, curriculum-aligned lesson plans and assessment items. Estimated cost: NPR 0 per school.

**Tier 2 — Teacher professional development:** Annual two-day residential workshops for in-service teachers, focused on practical demonstration and low-cost observational activities. Estimated cost: NPR 8,000 per teacher per year.

**Tier 3 — School telescope network:** Shared telescope pools (one per cluster of 5 schools) with trained coordinators. Estimated cost: NPR 45,000 per cluster, one-time.

## Pilot Results

Eight schools in Bagmati and Gandaki provinces participated in a 12-month Tier 1 + Tier 2 pilot (September 2021 – August 2022). Post-pilot surveys showed:
- Student interest scores increased by 0.8 standard deviations
- Teacher confidence increased across all astronomy topics (average +1.4 points on a 5-point scale)
- Zero change in examination results (expected, given Tier 3 not yet implemented)

## Conclusion

Astronomy education in Nepal faces structural barriers that cannot be addressed by curriculum intent alone. Our findings support a sequenced, resource-appropriate intervention model. Eka Research will make all Tier 1 materials freely available under Creative Commons licence in January 2023.`,
    },

    /* ── 7 · Open journal paper ─────────────────────────────────────── */
    {
      title: "V-Band Photometry of Long-Period Variable Stars from a High-Altitude Site in Nepal: New Periods for Six Previously Uncharacterised Objects",
      authors: JSON.stringify(["T. Shrestha", "P. Thapa", "A. Sharma", "G. Acharya"]),
      ekaAuthors: JSON.stringify(["T. Shrestha", "P. Thapa", "A. Sharma"]),
      internalContributors: JSON.stringify([]),
      journal: "Publications of the Astronomical Society of the Pacific",
      publicationDate: "2022-03-19",
      publicationStatus: "published",
      year: 2022,
      date: "2022-03-19",
      type: "journal",
      disciplines: JSON.stringify(["Observational Astronomy", "Astrophysics", "Stellar Physics"]),
      abstract: "We present V-band differential light curves for 47 long-period variable (LPV) stars monitored over two observing seasons (Oct 2020 – Apr 2022) from Eka Research's Nagarkot station at 2,175 m altitude. Lomb-Scargle periodogram analysis yields period solutions for 38 of the 47 targets. Six objects have no previously published periods in either the AAVSO International Variable Star Index or the General Catalogue of Variable Stars; we report periods between 93 and 412 days for these stars.",
      imageUrl: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?auto=format&fit=crop&w=800&q=80",
      doi: "10.1088/1538-3873/ac5f2a",
      featured: false,
      published: true,
      isPremium: false,
      submissionStatus: "approved",
      content: `# Introduction

Long-period variable (LPV) stars — a class encompassing Mira variables, semi-regular variables, and slow irregulars — are among the brightest intrinsically luminous stars in the Galaxy. Their pulsation periods, typically ranging from 80 to 1,000 days, are tightly correlated with intrinsic luminosity (the Period-Luminosity relation, or PLR), making them valuable standard candles for distances out to the Magellanic Clouds and beyond.

Despite their brightness and scientific importance, many LPVs visible from South Asian latitudes remain poorly characterised due to a historic gap in systematic monitoring from this part of the world. The Eka Nagarkot station's 2,175 m altitude, good transparency, and declination coverage of −30° to +85° make it well-suited for LPV monitoring.

## Observations

### Instrument Setup

- **Telescope:** Sky-Watcher 200P Dobsonian, f/6 (focal reducer to f/4.7 for field coverage)
- **Camera:** ZWO ASI294MC-Pro (cooled to −15°C)
- **Filter:** Astrodon Photometrics V-band (50 mm, photometric quality)
- **Field of view:** 1.2° × 0.8°
- **Typical seeing:** 2.1 arcsec FWHM (median)

### Target Selection

Targets were selected from the AAVSO Suspected Variable Star list and cross-matched with Gaia DR2 to exclude known non-variables. The 47 targets have V-band magnitudes between 7.8 and 13.4 at maximum light.

### Reduction Pipeline

Images are bias-subtracted, dark-corrected, and flat-fielded using master calibration frames taken nightly. Aperture photometry is performed with \`photutils\` with aperture radius set to 1.5× the seeing FWHM. Differential magnitudes are computed relative to three to five comparison stars per field with known AAVSO-standard V magnitudes.

## Period Analysis

Lomb-Scargle periodograms were computed for each star over the frequency range 0.001–0.02 cycles day⁻¹ (periods 50–1,000 days). The dominant period was accepted if the false alarm probability was < 0.01 and the peak power exceeded three times the local noise level.

### Period Solutions

Of the 47 targets, 38 yielded confident periods. The remaining 9 show irregular behaviour inconsistent with a single dominant period; these are flagged as slow irregulars in the catalogue.

### New Periods

Six objects had no published period in AAVSO VSX or GCVS at the time of submission:

| Designation | RA (J2000) | Dec (J2000) | Period (d) | Type |
| --- | --- | --- | --- | --- |
| EKA-LPV-001 | 08 14 22.4 | +27 31 08 | 93.2 ± 1.1 | SRb |
| EKA-LPV-002 | 09 44 55.1 | +31 07 44 | 147.8 ± 2.4 | Mira |
| EKA-LPV-003 | 11 22 08.7 | +19 58 31 | 218.5 ± 3.8 | Mira |
| EKA-LPV-004 | 14 03 41.2 | +25 44 17 | 284.0 ± 5.1 | SRa |
| EKA-LPV-005 | 17 51 14.9 | +28 02 55 | 339.7 ± 6.6 | Mira |
| EKA-LPV-006 | 20 28 33.3 | +29 11 42 | 412.2 ± 9.3 | Mira |

All six have been submitted to the AAVSO VSX under the designations above.

## Discussion

The Nagarkot site performs comparably to established LPV monitoring networks operating at similar altitudes in the Canary Islands and South Africa. The main limitation is the monsoon gap (June–September), which introduces an annual data gap of ~120 days. For periods shorter than this gap, aliasing can produce spurious period solutions; we mitigated this by restricting period searches to > 90 days and verifying all solutions against independent half-datasets.

## Conclusion

The Eka Nagarkot LPV monitoring programme has produced the first systematic variable star dataset from Nepal, yielding new period determinations for six previously uncharacterised objects and contributing to the global LPV monitoring network. The full photometric dataset is available at the Eka Research data portal.`,
    },

    /* ── 8 · Short technical report ─────────────────────────────────── */
    {
      title: "Design and Performance of a Low-Cost, Open-Source All-Sky Camera for Meteor Detection in Resource-Limited Settings",
      authors: JSON.stringify(["R. Adhikari", "A. Sharma"]),
      ekaAuthors: JSON.stringify(["R. Adhikari", "A. Sharma"]),
      internalContributors: JSON.stringify([]),
      journal: "Eka Research Technical Report Series",
      publicationDate: "2021-08-30",
      publicationStatus: "published",
      year: 2021,
      date: "2021-08-30",
      type: "report",
      disciplines: JSON.stringify(["Instrumentation", "Meteor Science"]),
      abstract: "We describe the hardware and software design of the ASC-EKA1, a low-cost all-sky camera system built for meteor detection in environments with unreliable power supply and limited internet connectivity. Total component cost is USD 320 per station. The system uses a Raspberry Pi 4B, a Sony IMX290 sensor with a 1.55 mm fisheye lens, and a custom Python detection pipeline. Over 180 nights of operation at an off-grid Himalayan site, the system achieved 94.7% uptime and detected 1,240 meteors.",
      imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
      featured: false,
      published: true,
      isPremium: false,
      submissionStatus: "approved",
      content: `# Motivation

Commercial all-sky meteor cameras cost USD 1,500–4,000 per station, placing them out of reach for most institutions in South Asia. Open-source alternatives such as RMS (Raspberry Meteor Station) and UFO Capture exist but are designed for grid-connected, internet-connected environments with reliable 220V AC power.

The ASC-EKA1 was designed to operate from a 12V solar/battery system at remote mountain sites, with intermittent 4G connectivity, at a component cost under USD 350.

## Hardware Design

### Bill of Materials

| Component | Specification | Cost (USD) |
| --- | --- | --- |
| Single-board computer | Raspberry Pi 4B, 4 GB | 55 |
| Image sensor | Sony IMX290 (1/2.8", 2.1 MP) | 65 |
| Lens | 1.55 mm f/1.2 fisheye, CS-mount | 38 |
| Weatherproof housing | IP67 dome, polycarbonate | 42 |
| Heater | 5W nichrome element + thermostat | 14 |
| Power supply | 12V DC–DC converter, 3A | 18 |
| Storage | 128 GB microSD (Class 10) | 12 |
| GPS module | u-blox NEO-6M | 9 |
| Miscellaneous | Cabling, connectors, mounting | 47 |
| **Total** | | **300** |

### Dome Heating

At the Nagarkot site, dome dew and frosting are common during autumn and winter nights. A 5W heater element controlled by a DS18B20 temperature sensor maintains dome temperature 3°C above ambient, preventing condensation. Power draw including heater: 7.5W average.

## Software Pipeline

The detection pipeline runs as a \`systemd\` service on the Raspberry Pi. Each night:

1. **Acquisition:** 25 fps video is captured continuously using \`raspivid\` with hardware H.264 encoding disabled (raw YUV420 frames)
2. **Frame differencing:** Consecutive frames are subtracted; connected components above a pixel area threshold are flagged as candidate events
3. **Filtering:** Candidates are rejected if duration < 0.04 s, length < 5 pixels, or angular velocity > 40° s⁻¹ (satellite threshold)
4. **Archive:** Passing candidates are saved as 4-second FITS clips with metadata JSON. Full-night video is discarded after event extraction.
5. **Upload:** Event clips are uploaded via rsync over 4G when connectivity is available; the system queues uploads locally if offline.

## Performance Results

The unit was deployed at a solar-powered site at 2,100 m altitude near Gorkha from September 2020 to April 2021 (180 nights). Key metrics:

- **Uptime:** 94.7% of night-hours
- **False positive rate:** 8.2% (primary cause: low-flying aircraft on nights with low cloud ceiling)
- **Detection sensitivity:** Limiting magnitude +4.5 (based on comparison with concurrent Allsky7 unit at the same site)
- **Power consumption:** 7.2W average, compatible with a 40W solar panel and 50Ah battery

## Comparison with Commercial System

Side-by-side testing against a Watec 910HX camera at EKA-N01 during January–February 2021 showed the ASC-EKA1 detected 87% of meteors logged by the reference system at magnitude < +3.0, dropping to 64% at magnitudes +3.5 to +4.5 due to the lower dynamic range of the IMX290 sensor.

## Conclusion

The ASC-EKA1 provides a viable, sub-USD-350 path to professional-grade meteor detection in resource-limited environments. Design files, firmware, and the detection pipeline are released under MIT licence at github.com/eka-research/asc-eka1.`,
    },
  ];

  for (const a of articles) {
    await db.researchArticle.create({ data: a });
  }
  console.log(`✓ Seeded ${articles.length} research articles (with full paper content)`);

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
        emailVerified: true,
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

  // ── Seed Vacancies ──────────────────────────────────────────────────
  const vacancyCount = await db.vacancy.count();
  if (vacancyCount === 0) {
    await db.vacancy.createMany({
      data: [
        {
          title: "Space Science Research Intern",
          type: "INTERNSHIP",
          department: "Astronomy & Astrophysics",
          description: "We are seeking a highly motivated undergraduate or graduate student to join our Astronomy division. You will work on analyzing incoming telescope observation logs and planetary imagery. Requirements: Basic knowledge of Python and astrophysical concepts. Duration: 3 months (Kathmandu based / hybrid).",
          deadline: new Date("2026-06-30T23:59:59Z"),
          status: "OPEN",
        },
        {
          title: "Aerospace Engineer (Satellite R&D)",
          type: "FULL_TIME",
          department: "Engineering & Instrumentation",
          description: "Join Eka's engineering division to lead the design and assembly of ground-based instrument payloads and high-altitude balloon subsystems. Requirements: Bachelor's degree in Aerospace, Mechanical, or Electronics Engineering; experience with CAD tools and embedded systems.",
          deadline: new Date("2026-07-15T23:59:59Z"),
          status: "OPEN",
        },
        {
          title: "Atmospheric Science Data Analyst",
          type: "PART_TIME",
          department: "Atmospheric Physics",
          description: "Review and calibrate air quality and meteorological datasets from our mountain sensor grid. Experience with Jupyter notebooks and statistical modeling is required. Part-time (20 hours/week).",
          deadline: null,
          status: "OPEN",
        },
        {
          title: "Science Communication & Outreach Officer",
          type: "VOLUNTEER",
          department: "Public Programs",
          description: "Help design science program newsletters, engage with our community on social media, and coordinate school telescope stargazing visits. Perfect for high school seniors or college students wanting to practice science writing.",
          deadline: new Date("2026-05-31T23:59:59Z"),
          status: "DRAFT",
        }
      ]
    });
    console.log("✓ Seeded 4 vacancies");
  } else {
    console.log(`  Vacancies already has ${vacancyCount} records — skipping.`);
  }

  // ── Seed MentoringProgram & Mentors ──────────────────────────────────
  const mentoringProgramCount = await db.mentoringProgram.count();
  if (mentoringProgramCount === 0) {
    await db.mentoringProgram.create({
      data: {
        description: "Connect 1-on-1 with experienced space science researchers, academics, and outreach specialists. You will work together to navigate academic paths, master coding for astrophysics, or design community outreach programs.",
        duration: "6 months",
        structure: "Minimum monthly meeting. Flexible remote-friendly coordination. Milestone checkpoints in months 2, 4, and 6.",
        nextCohort: new Date("2026-09-01T00:00:00Z"),
        isOpen: true,
      }
    });

    await db.mentor.createMany({
      data: [
        {
          name: "Dr. Abhas Sharma",
          expertise: "Observational Astronomy",
          bio: "Astrophysicist specializing in variable stars and optical photometry systems. Abhas returned to Nepal after research stints in the UK and Australia to lead Eka's telescope network.",
          imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
          linkedIn: "https://linkedin.com/in/abhas-sharma-dummy",
          active: true,
        },
        {
          name: "Dr. Prabha Thapa",
          expertise: "Atmospheric Physics",
          bio: "Senior scientist focusing on stratosphere-troposphere exchange dynamics and aerosol variations across the Himalayan ridge. Lead researcher of the StratoNepal balloon missions.",
          imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80",
          linkedIn: "https://linkedin.com/in/prabha-thapa-dummy",
          active: true,
        },
        {
          name: "Rajan Adhikari, M.Sc.",
          expertise: "Instrumentation & Embedded Systems",
          bio: "Electrical engineer designing all-sky meteor camera networks and custom data logging sensors. Rajan coaches students in hardware prototyping and microcontroller firmware.",
          imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
          linkedIn: "https://linkedin.com/in/rajan-adhikari-dummy",
          active: true,
        }
      ]
    });
    console.log("✓ Seeded mentoring program and 3 mentors");
  } else {
    console.log(`  MentoringProgram already has ${mentoringProgramCount} records — skipping.`);
  }

  // ── Seed TeamMembers ────────────────────────────────────────────────
  const teamMemberCount = await db.teamMember.count();
  if (teamMemberCount === 0) {
    const teamMembers = [
      {
        name: "Dr. Abhas Sharma",
        role: "Founder & Director",
        bio: "Astrophysicist. Founded Eka Research in 2020 with the goal of building Nepal's first independent space science institution. Previously researcher at Tribhuvan University.",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
        featured: true,
        order: 1,
      },
      {
        name: "Dr. Prabha Thapa",
        role: "Head of Research",
        bio: "Atmospheric physicist focused on high-altitude balloon payloads and cosmic ray detection above the Himalayas.",
        imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
        featured: false,
        order: 2,
      },
      {
        name: "Anisha Bajracharya",
        role: "Outreach Coordinator",
        bio: "Science communicator and educator designing all public programmes and community partnerships.",
        imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
        featured: false,
        order: 3,
      },
      {
        name: "Rajan Adhikari, M.Sc.",
        role: "Instrumentation Lead",
        bio: "Electronics engineer responsible for the All Sky Camera network and all on-site instrumentation across Nepal.",
        imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
        featured: false,
        order: 4,
      },
      {
        name: "Jaysi Sharma",
        role: "Data Scientist",
        bio: "Processes and archives meteor, space weather, and atmospheric datasets. Builds the tools members use to access research data.",
        imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
        featured: false,
        order: 5,
      },
      {
        name: "Sunita Gurung",
        role: "Education Research Lead",
        bio: "Develops evidence-based science communication methods tailored to the Nepali curriculum and classroom context.",
        imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
        featured: false,
        order: 6,
      },
    ];

    for (const m of teamMembers) {
      await db.teamMember.create({ data: m });
    }
    console.log(`✓ Seeded ${teamMembers.length} team members`);
  } else {
    console.log(`  Team already has ${teamMemberCount} members — skipping.`);
  }
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
