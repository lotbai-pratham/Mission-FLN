import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { DEFAULT_LOTB_CONFIG } from '@/lib/lotb_config';

export async function GET() {
  try {
    const s = await (prisma as any).systemSetting.findFirst({ where: { key: 'lotb_config' } });
    if (s && s.value) {
      let config = JSON.parse(s.value);
      config = {
        projects: config.projects || DEFAULT_LOTB_CONFIG.projects,
        msmsCohorts: config.msmsCohorts || DEFAULT_LOTB_CONFIG.msmsCohorts
      };
      return NextResponse.json(config);
    }
    return NextResponse.json(DEFAULT_LOTB_CONFIG);
  } catch (err) {
    return NextResponse.json(DEFAULT_LOTB_CONFIG);
  }
}
