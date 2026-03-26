export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import UpgradeClient from "./UpgradeClient";
import styles from "./page.module.css";

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const session = await auth();
  const { plan } = await searchParams;
  const safePlan = plan === "yearly" ? "yearly" : "monthly";

  if (!session) {
    const returnTo = `/upgrade?plan=${safePlan}`;
    redirect(`/auth/login?callbackUrl=${encodeURIComponent(returnTo)}`);
  }

  return (
    <div className={styles.page}>
      <UpgradeClient plan={safePlan} />
    </div>
  );
}
