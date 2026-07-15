import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      school: {
        include: {
          teachers: true,
          students: {
            orderBy: { id: "desc" },
            take: 10
          }
        }
      }
    }
  });

  if (!user) {
    redirect("/");
  }

  // Determine role-based access
  const isSchoolUser = user.role === "user";

  return (
    <ProfileClient 
      user={user as any} 
      isSchoolUser={isSchoolUser} 
    />
  );
}
