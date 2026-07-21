import { getAllExternalDashboards } from "@/app/actions/dashboards";
import DashboardAdminClient from "./DashboardAdminClient";

export const metadata = {
  title: "Admin - External Dashboards",
};

export default async function AdminDashboardsPage() {
  const dashboards = await getAllExternalDashboards();

  return (
    <div className="p-6">
      <DashboardAdminClient initialDashboards={dashboards} />
    </div>
  );
}
