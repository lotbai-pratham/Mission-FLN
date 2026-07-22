"use server";

import { prisma } from "@/lib/db";
import { revalidatePath, unstable_cache } from "next/cache";

interface LogSessionInput {
  schoolId: string;
  teacherName: string;
  classNum: number;
  subject?: string;
  totalDuration: number;
  activityLogs: any;
}

/**
 * Logs a completed Mission Mode session to the database.
 */
export async function logImplementationSession(data: LogSessionInput) {
  if (data.schoolId === 'guest-school') {
    return { success: true };
  }
  try {
    const session = await (prisma as any).implementationSession.create({
      data: {
        schoolId: data.schoolId,
        teacherName: data.teacherName,
        classNum: data.classNum,
        subject: data.subject || null,
        totalDuration: data.totalDuration,
        activityLogs: data.activityLogs,
      },
    });

    revalidatePath("/admin/data");
    return { success: true, session };
  } catch (error) {
    console.error("Failed to log implementation session:", error);
    return { success: false, error: "Database save failed" };
  }
}

/**
 * Fetches implementation logs for the admin dashboard.
 */
export async function getImplementationLogsAdmin(page: number = 1, schoolId?: string) {
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const where: any = {};
  if (schoolId) {
    where.schoolId = schoolId;
  }

  try {
    const [logs, total] = await Promise.all([
      (prisma as any).implementationSession.findMany({
        where,
        include: {
          school: {
            select: {
              name: true,
              udiseCode: true,
              projectOffice: {
                select: {
                  name: true,
                  division: {
                    select: { name: true }
                  }
                }
              }
            }
          }
        },
        orderBy: { conductedAt: "desc" },
        skip,
        take: pageSize,
      }),
      (prisma as any).implementationSession.count({ where }),
    ]);

    return {
      logs,
      total,
      pages: Math.ceil(total / pageSize),
    };
  } catch (error) {
    console.error("Failed to fetch implementation logs:", error);
    return { logs: [], total: 0, pages: 0 };
  }
}

// ─── Activity name maps for decoding activityLogs.completed keys ──────────
// Keys are "groupIdx-actIdx" → we map them per class/subject combo
const CLASS_12_ACTIVITIES: Record<string, string> = {
  '0-0': 'चला खेळूया (Play)',
  '0-1': 'चला ऐकुया (Listen)',
  '0-2': 'चला करूया (Do)',
  '0-3': 'TLM Activities',
};
const CLASS_34_LANG_ACTIVITIES: Record<string, string> = {
  '0-0': 'Warm Up', '0-1': 'Discussion & Story', '0-2': 'Sound Recognition',
  '0-3': 'Play (Word Games)', '0-4': 'Matra Practice', '0-5': 'Write',
  '1-0': 'Story Reading', '1-1': 'Mind Map', '1-2': 'Role Play Prep',
  '1-3': 'Writing (Worksheet)', '1-4': 'Role Play', '1-5': 'Writing', '1-6': 'Worksheet',
};
const CLASS_34_MATHS_ACTIVITIES: Record<string, string> = {
  '0-0': 'Warm-up Pre-Maths', '0-1': 'Discussion', '0-2': 'Number Recognition',
  '0-3': 'Operation & Word Problem', '0-4': 'Games',
  '1-0': 'Discussion', '1-1': 'Number Recognition', '1-2': 'Operation & Word Problem',
  '1-3': 'Small Group Work', '1-4': 'टिली-बंडल द्वंद्व', '1-5': 'संख्या चक्र',
  '1-6': 'डिजिटल अबॅकस', '1-7': 'गुणाकार शिका', '1-8': 'समान वाटणी',
  '1-9': 'वारंवार बेरीज', '1-10': 'अपूर्णांक', '1-11': 'समान वाटणी (भागाकार)',
};

function getActivityMap(classNum: number, subject: string | null): Record<string, string> {
  if (classNum <= 2) return CLASS_12_ACTIVITIES;
  if (subject === 'maths') return CLASS_34_MATHS_ACTIVITIES;
  return CLASS_34_LANG_ACTIVITIES;
}

/**
 * Returns comprehensive implementation analytics for the dashboard.
 */
export async function getImplementationAnalytics(filters: {
  divisionId?: string;
  projectOfficeId?: string;
  schoolId?: string;
  period?: '7d' | '30d' | 'all';
} = {}) {
  try {
    // Build school filter for hierarchy
    const schoolWhere: any = {};
    if (filters.schoolId) {
      schoolWhere.id = filters.schoolId;
    } else if (filters.projectOfficeId) {
      schoolWhere.projectOfficeId = filters.projectOfficeId;
    } else if (filters.divisionId) {
      schoolWhere.projectOffice = { divisionId: filters.divisionId };
    }

    // Date cutoff for period
    const now = new Date();
    let dateCutoff: Date | null = null;
    if (filters.period === '7d') {
      dateCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (filters.period === '30d' || !filters.period) {
      dateCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    // 'all' → no cutoff

    // Fetch all schools matching filter (including those with 0 sessions)
    const allSchools = await prisma.school.findMany({
      where: schoolWhere,
      select: {
        id: true,
        name: true,
        projectOffice: {
          select: {
            name: true,
            division: { select: { name: true } }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Fetch sessions matching school filter + date range
    const sessionWhere: any = {
      school: Object.keys(schoolWhere).length > 0 ? schoolWhere : undefined,
    };
    if (dateCutoff) {
      sessionWhere.conductedAt = { gte: dateCutoff };
    }

    const sessions = await (prisma as any).implementationSession.findMany({
      where: sessionWhere,
      select: {
        id: true,
        schoolId: true,
        teacherName: true,
        classNum: true,
        subject: true,
        totalDuration: true,
        activityLogs: true,
        conductedAt: true,
      },
      orderBy: { conductedAt: 'desc' },
    });

    // ── KPIs ──
    const activeSchoolIds = new Set(sessions.map((s: any) => s.schoolId));
    const totalSessions = sessions.length;
    const avgDuration = totalSessions > 0
      ? Math.round(sessions.reduce((sum: number, s: any) => sum + (s.totalDuration || 0), 0) / totalSessions / 60)
      : 0;

    // Avg completion rate
    let totalCompletionPct = 0;
    let completionCount = 0;
    for (const s of sessions) {
      const logs = s.activityLogs as any;
      if (logs?.completed) {
        const actMap = getActivityMap(s.classNum, s.subject);
        const expectedCount = Object.keys(actMap).length;
        if (expectedCount > 0) {
          totalCompletionPct += (logs.completed.length / expectedCount) * 100;
          completionCount++;
        }
      }
    }
    const avgCompletion = completionCount > 0 ? Math.round(totalCompletionPct / completionCount) : 0;

    // ── School Table ──
    // Also fetch ALL sessions (no date filter) for "last session" column
    const allSessions = dateCutoff
      ? await (prisma as any).implementationSession.findMany({
          where: { school: Object.keys(schoolWhere).length > 0 ? schoolWhere : undefined },
          select: { schoolId: true, conductedAt: true, totalDuration: true, activityLogs: true, classNum: true, subject: true },
          orderBy: { conductedAt: 'desc' },
        })
      : sessions;

    const schoolSessionMap: Record<string, any[]> = {};
    for (const s of allSessions) {
      if (!schoolSessionMap[s.schoolId]) schoolSessionMap[s.schoolId] = [];
      schoolSessionMap[s.schoolId].push(s);
    }

    // For period-filtered counts
    const periodSessionMap: Record<string, any[]> = {};
    for (const s of sessions) {
      if (!periodSessionMap[s.schoolId]) periodSessionMap[s.schoolId] = [];
      periodSessionMap[s.schoolId].push(s);
    }

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const schoolTable = allSchools.map(school => {
      const allSchoolSessions = schoolSessionMap[school.id] || [];
      const periodSessions = periodSessionMap[school.id] || [];
      const lastSession = allSchoolSessions.length > 0 ? allSchoolSessions[0].conductedAt : null;
      const avgDur = periodSessions.length > 0
        ? Math.round(periodSessions.reduce((s: number, sess: any) => s + (sess.totalDuration || 0), 0) / periodSessions.length / 60)
        : 0;

      // Completion rate for this school
      let schoolCompPct = 0;
      let schoolCompCount = 0;
      for (const sess of periodSessions) {
        const logs = sess.activityLogs as any;
        if (logs?.completed) {
          const actMap = getActivityMap(sess.classNum, sess.subject);
          const expected = Object.keys(actMap).length;
          if (expected > 0) {
            schoolCompPct += (logs.completed.length / expected) * 100;
            schoolCompCount++;
          }
        }
      }

      // Status
      let status: 'active' | 'stale' | 'inactive' = 'inactive';
      if (lastSession) {
        const lastDate = new Date(lastSession);
        if (lastDate >= sevenDaysAgo) status = 'active';
        else if (lastDate >= thirtyDaysAgo) status = 'stale';
      }

      return {
        id: school.id,
        name: school.name,
        poName: school.projectOffice.name,
        divName: school.projectOffice.division.name,
        totalSessions: periodSessions.length,
        lastSession,
        avgDuration: avgDur,
        completionRate: schoolCompCount > 0 ? Math.round(schoolCompPct / schoolCompCount) : 0,
        status,
      };
    }).sort((a, b) => b.totalSessions - a.totalSessions);

    // ── Activity Breakdown ──
    // Aggregate across all sessions: count how many times each activity key was completed
    const activityCounts: Record<string, { completed: number; total: number; name: string }> = {};

    for (const s of sessions) {
      const logs = s.activityLogs as any;
      const actMap = getActivityMap(s.classNum, s.subject);
      const completedSet = new Set(logs?.completed || []);

      for (const [key, name] of Object.entries(actMap)) {
        if (!activityCounts[name]) activityCounts[name] = { completed: 0, total: 0, name };
        activityCounts[name].total += 1;
        if (completedSet.has(key)) activityCounts[name].completed += 1;
      }
    }

    const activityBreakdown = Object.values(activityCounts)
      .map(a => ({
        name: a.name,
        rate: a.total > 0 ? Math.round((a.completed / a.total) * 100) : 0,
        completed: a.completed,
        total: a.total,
      }))
      .sort((a, b) => b.rate - a.rate);

    // ── Weekly Trend (last 12 weeks) ──
    const twelveWeeksAgo = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
    const trendSessions = allSessions.filter((s: any) => new Date(s.conductedAt) >= twelveWeeksAgo);

    const weeklyData: Record<string, number> = {};
    for (let w = 0; w < 12; w++) {
      const weekStart = new Date(now.getTime() - (11 - w) * 7 * 24 * 60 * 60 * 1000);
      const weekLabel = `W${w + 1}`;
      weeklyData[weekLabel] = 0;
    }

    for (const s of trendSessions) {
      const sessionDate = new Date(s.conductedAt);
      const weeksAgo = Math.floor((now.getTime() - sessionDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      const weekIdx = 11 - Math.min(weeksAgo, 11);
      const weekLabel = `W${weekIdx + 1}`;
      if (weeklyData[weekLabel] !== undefined) {
        weeklyData[weekLabel]++;
      }
    }

    const weeklyTrend = Object.entries(weeklyData).map(([week, count]) => ({
      week,
      sessions: count,
    }));

    return {
      kpis: {
        activeSchools: activeSchoolIds.size,
        totalSchools: allSchools.length,
        totalSessions,
        avgDuration,
        avgCompletion,
      },
      schoolTable,
      activityBreakdown,
      weeklyTrend,
    };
  } catch (error) {
    console.error("Failed to fetch implementation analytics:", error);
    return {
      kpis: { activeSchools: 0, totalSchools: 0, totalSessions: 0, avgDuration: 0, avgCompletion: 0 },
      schoolTable: [],
      activityBreakdown: [],
      weeklyTrend: [],
    };
  }
}
