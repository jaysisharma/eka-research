import { db } from "@/lib/db";
import type { ArticleType } from "@/lib/constants";

export type ResearchArticle = {
  id: string;
  title: string;
  authors: string[];
  ekaAuthors: string[];
  journal: string;
  year: number;
  date: string;
  publicationDate: string;
  publicationStatus: string;
  type: ArticleType;
  disciplines: string[];
  abstract: string;
  imageUrl: string | null;
  doi: string | null;
  arxiv: string | null;
  pdfUrl: string | null;
  externalUrl: string | null;
  githubUrl: string | null;
  datasetUrl: string | null;
  featured: boolean;
  published: boolean;
  isPremium: boolean;
  content: string | null;
};



type DbArticle = {
  id: string;
  title: string;
  authors: string;
  ekaAuthors: string;
  journal: string;
  year: number;
  date: string;
  publicationDate: string;
  publicationStatus: string;
  type: string;
  disciplines: string;
  abstract: string;
  imageUrl: string | null;
  doi: string | null;
  arxiv: string | null;
  pdfUrl: string | null;
  externalUrl: string | null;
  githubUrl: string | null;
  datasetUrl: string | null;
  featured: boolean;
  published: boolean;
  isPremium: boolean;
  content: string | null;
};

function toArticle(a: DbArticle): ResearchArticle {
  return {
    ...a,
    authors: JSON.parse(a.authors) as string[],
    ekaAuthors: JSON.parse(a.ekaAuthors) as string[],
    disciplines: JSON.parse(a.disciplines) as string[],
    type: a.type as ArticleType,
  };
}

export async function getPublishedArticles(): Promise<ResearchArticle[]> {
  const rows = await db.researchArticle.findMany({
    // Double-guard: both admin approval flags must be set
    where: {
      published: true,
      submissionStatus: "approved",
    },
    orderBy: [{ year: "desc" }, { date: "desc" }],
  });
  return rows.map(toArticle);
}

export async function getArticleById(id: string): Promise<ResearchArticle | null> {
  const row = await db.researchArticle.findUnique({ where: { id } });
  return row ? toArticle(row) : null;
}
