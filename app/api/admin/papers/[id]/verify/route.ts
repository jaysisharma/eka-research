import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/admin/papers/[id]/verify
 *  Body: { action: "approve" | "reject" }
 *  - approve → submissionStatus = "approved", published = true
 *  - reject  → submissionStatus = "rejected", published = false
 */
export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id }    = await params;
  const { action } = await req.json() as { action: "approve" | "reject" };

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "action must be approve or reject" }, { status: 400 });
  }

  const paper = await db.researchArticle.update({
    where: { id },
    data: {
      submissionStatus: action === "approve" ? "approved" : "rejected",
      published:        action === "approve",
    },
  });

  return NextResponse.json(paper);
}
