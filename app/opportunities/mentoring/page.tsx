export const dynamic = "force-dynamic";

import { buildMetadata } from "@/lib/seo";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MentoringList from "./MentoringList";

export const metadata = buildMetadata({
  title: "Mentoring Program",
  description:
    "Connect with active researchers, academics, and science communicators at Eka Research. Free 1-on-1 mentoring for students and early-career scientists in Nepal.",
  path: "/opportunities/mentoring",
});

export default async function MentoringPage() {
  const session = await auth();
  const isLoggedIn = !!session;

  // Retrieve the mentoring program cohort settings
  let program = await prisma.mentoringProgram.findFirst({
    orderBy: { createdAt: "asc" },
  });

  // Safe fallback if the database has not been seeded yet
  if (!program) {
    program = {
      id: "fallback-program",
      description:
        "Connect with active researchers, academics, and science communicators at Eka Research. Free 1-on-1 mentoring for students and early-career scientists in Nepal.",
      duration: "Ongoing, no fixed end",
      structure: "1-on-1 mentoring support sessions",
      nextCohort: null,
      isOpen: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Retrieve all active mentor cards from PostgreSQL
  const dbMentors = await prisma.mentor.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  // Serialize models correctly to prevent date boundaries passing issue
  const serializedProgram = {
    id: program.id,
    description: program.description,
    duration: program.duration,
    structure: program.structure,
    nextCohort: program.nextCohort ? program.nextCohort.toISOString() : null,
    isOpen: program.isOpen,
  };

  const serializedMentors = dbMentors.map((m) => ({
    id: m.id,
    name: m.name,
    expertise: m.expertise,
    bio: m.bio,
    imageUrl: m.imageUrl,
    linkedIn: m.linkedIn,
  }));

  return (
    <main>
      <MentoringList
        program={serializedProgram}
        mentors={serializedMentors}
        isLoggedIn={isLoggedIn}
        user={session?.user}
      />
    </main>
  );
}
