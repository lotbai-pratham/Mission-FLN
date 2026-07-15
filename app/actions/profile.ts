"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updateProfilePicture(base64Image: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  await prisma.user.update({
    where: { email: session.user.email },
    data: { image: base64Image },
  });

  revalidatePath("/", "layout");
}

export async function changePassword(newPassword: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const hash = await bcrypt.hash(newPassword, 10);
  
  await prisma.user.update({
    where: { email: session.user.email },
    data: { passwordHash: hash },
  });

  revalidatePath("/", "layout");
}

export async function updateSchoolDetails(data: {
  schoolType?: string;
  medium?: string;
  principalName?: string;
  principalMobile?: string;
}) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { schoolId: true }
  });

  if (!user?.schoolId) throw new Error("User does not belong to a school");

  await prisma.school.update({
    where: { id: user.schoolId },
    data: {
      schoolType: data.schoolType,
      medium: data.medium,
      principalName: data.principalName,
      principalMobile: data.principalMobile
    }
  });

  revalidatePath("/profile");
}

export async function addTeacher(data: { name: string; mobile?: string; class?: string }) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { schoolId: true }
  });

  if (!user?.schoolId) throw new Error("User does not belong to a school");

  await prisma.teacher.create({
    data: {
      name: data.name,
      mobile: data.mobile,
      class: data.class,
      schoolId: user.schoolId
    }
  });

  revalidatePath("/profile");
}

export async function deleteTeacher(teacherId: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { schoolId: true }
  });

  if (!user?.schoolId) throw new Error("User does not belong to a school");

  // Verify teacher belongs to this school
  const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
  if (teacher?.schoolId !== user.schoolId) throw new Error("Unauthorized");

  await prisma.teacher.delete({ where: { id: teacherId } });

  revalidatePath("/profile");
}

export async function addStudentToSchool(data: { name: string; class: number }) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  // Restrictions requested by user: Grades 1-4 only
  if (data.class < 1 || data.class > 4) {
    throw new Error("Only students from Grades 1 to 4 can be added.");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { school: true }
  });

  if (!user?.schoolId || !user.school) throw new Error("User does not belong to a school");

  // Generate a UID based on udise and count (simple fallback generation)
  const count = await prisma.student.count({ where: { schoolId: user.schoolId } });
  const uid = `${user.school.udiseCode}-${count + 1}`;

  await prisma.student.create({
    data: {
      name: data.name,
      class: data.class,
      gender: "Other", // Default, can be expanded later if needed
      uid: uid,
      schoolId: user.schoolId
    }
  });

  revalidatePath("/profile");
}

export async function updateProjectOfficeDetails(data: {
  projectOfficerName?: string;
  apoEducationName?: string;
  mobileNumber?: string;
  extensionOfficers?: string;
}) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { projectOfficeId: true }
  });

  if (!user?.projectOfficeId) throw new Error("User does not belong to a project office");

  await prisma.projectOffice.update({
    where: { id: user.projectOfficeId },
    data: {
      projectOfficerName: data.projectOfficerName,
      apoEducationName: data.apoEducationName,
      mobileNumber: data.mobileNumber,
      extensionOfficers: data.extensionOfficers
    }
  });

  revalidatePath("/profile");
}
