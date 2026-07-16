"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function logDataAccess(data: { name: string; designation: string }) {
  const session = await auth();
  
  await prisma.dataAccessLog.create({
    data: {
      userId: session?.user?.id || null,
      name: data.name,
      designation: data.designation,
    }
  });

  return { success: true };
}

export async function getDataAccessLogs() {
  const logs = await prisma.dataAccessLog.findMany({
    orderBy: { accessedAt: 'desc' },
    include: {
      user: {
        select: { email: true, role: true }
      }
    },
    take: 100
  });
  return logs;
}
