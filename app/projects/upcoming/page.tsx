import { redirect } from "next/navigation";

export default function UpcomingProjectsPage() {
  redirect("/projects?status=upcoming");
}
