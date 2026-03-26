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
  type: ArticleType;
  disciplines: string[];
  abstract: string;
  imageUrl: string | null;
  doi: string | null;
  arxiv: string | null;
  featured: boolean;
  published: boolean;
};

type DbArticle = {
  id: string;
  title: string;
  authors: string;
  ekaAuthors: string;
  journal: string;
  year: number;
  date: string;
  type: string;
  disciplines: string;
  abstract: string;
  imageUrl: string | null;
  doi: string | null;
  arxiv: string | null;
  featured: boolean;
  published: boolean;
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
    where: { published: true },
    orderBy: [{ year: "desc" }, { date: "desc" }],
  });
  return rows.map(toArticle);
}

export async function getArticleById(id: string): Promise<ResearchArticle | null> {
  const row = await db.researchArticle.findUnique({ where: { id } });
  return row ? toArticle(row) : null;
}
