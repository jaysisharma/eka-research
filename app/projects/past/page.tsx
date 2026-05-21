import { redirect } from "next/navigation";

export default function PastProjectsPage() {
  redirect("/projects?status=completed");
}
