"use server";

import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// Initialize Prisma directly for the edge case where proxy isn't used
const prisma = new PrismaClient();

export async function getActiveExternalDashboards() {
  try {
    const dashboards = await prisma.externalDashboard.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
    return dashboards;
  } catch (error) {
    console.error("Failed to fetch active external dashboards:", error);
    return [];
  }
}

export async function getAllExternalDashboards() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  try {
    const dashboards = await prisma.externalDashboard.findMany({
      orderBy: { order: "asc" },
    });
    return dashboards;
  } catch (error) {
    console.error("Failed to fetch all external dashboards:", error);
    return [];
  }
}

export async function createExternalDashboard(data: {
  title: string;
  description?: string;
  imageUrl?: string;
  linkUrl: string;
  order: number;
  isActive: boolean;
}) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  try {
    const newDashboard = await prisma.externalDashboard.create({
      data,
    });
    
    revalidatePath("/dashboards");
    revalidatePath("/admin/dashboards");
    return { success: true, data: newDashboard };
  } catch (error: any) {
    console.error("Failed to create external dashboard:", error);
    return { success: false, error: error.message };
  }
}

export async function updateExternalDashboard(
  id: string,
  data: {
    title?: string;
    description?: string;
    imageUrl?: string;
    linkUrl?: string;
    order?: number;
    isActive?: boolean;
  }
) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  try {
    const updatedDashboard = await prisma.externalDashboard.update({
      where: { id },
      data,
    });
    
    revalidatePath("/dashboards");
    revalidatePath("/admin/dashboards");
    return { success: true, data: updatedDashboard };
  } catch (error: any) {
    console.error("Failed to update external dashboard:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteExternalDashboard(id: string) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.externalDashboard.delete({
      where: { id },
    });
    
    revalidatePath("/dashboards");
    revalidatePath("/admin/dashboards");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete external dashboard:", error);
    return { success: false, error: error.message };
  }
}
