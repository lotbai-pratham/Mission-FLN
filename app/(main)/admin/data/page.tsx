export const dynamic = 'force-dynamic';
import { getAssessmentsAdmin } from "@/app/actions";
import { getImplementationLogsAdmin } from "@/app/actions/implementation";
import { getDataAccessLogs } from "@/app/actions/consent";
import DataClient from "./DataClient";
import { auth } from "@/auth";
import { hasRole } from "@/lib/checkAccess";
import { redirect } from "next/navigation";

export default async function AdminDataPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; term?: string; schoolId?: string; tab?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();
  
  if (!hasRole(session, "admin")) {
    redirect("/dashboard");
  }

  const page = Number(params.page ?? 1);
  const tab = params.tab ?? "assessments";

  let data: any = { items: [], total: 0, pages: 0 };

  if (tab === "implementation") {
    const result = await getImplementationLogsAdmin(page, params.schoolId);
    data = { items: result.logs, total: result.total, pages: result.pages };
  } else if (tab === "access_logs") {
    const logs = await getDataAccessLogs();
    data = { items: logs, total: logs.length, pages: 1 };
  } else {
    const { assessments, total, pages } = await getAssessmentsAdmin(
      page,
      params.schoolId,
      params.term
    );
    data = { items: assessments, total, pages };
  }

  return (
    <DataClient
      initialItems={data.items as any}
      total={data.total}
      pages={data.pages}
      currentPage={page}
      activeTab={tab as "assessments" | "implementation" | "access_logs"}
    />
  );
}
