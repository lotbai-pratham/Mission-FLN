export const dynamic = 'force-dynamic';
import { getSchoolCredentials, getHierarchy } from '@/app/actions';
import LoginsClient from './LoginsClient';

export default async function SchoolLoginsPage() {
  const credentials = await getSchoolCredentials();
  const hierarchy = await getHierarchy();
  return <LoginsClient initialCredentials={credentials} hierarchy={hierarchy} />;
}
