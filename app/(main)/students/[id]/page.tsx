export const dynamic = 'force-dynamic';
import { getStudentProfile } from "@/app/actions";
import ProfileClient from "./ProfileClient";

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const student = await getStudentProfile(resolvedParams.id);
  
  if (!student) return <div className="p-10 text-center text-slate-500">Student not found.</div>;

  return <ProfileClient student={student} />;
}
