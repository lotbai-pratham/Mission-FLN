export const dynamic = 'force-dynamic';
import { getHierarchy, getSettings } from "@/app/actions";
import LiveTrackerClient from "./client-page";
import { auth } from "@/auth";
import { hasRole } from "@/lib/checkAccess";

export default async function LiveAssessmentPage() {
  const hierarchy = await getHierarchy();
  const settings = await getSettings();
  const session = await auth();
  const isAdmin = hasRole(session, "admin");

  return <LiveTrackerClient hierarchy={hierarchy} settings={settings} isAdmin={isAdmin} />;
}
