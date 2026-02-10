import WorkerDash from '~/components/pages/worker/WorkerDash';
import { getCachedSession } from '~/lib/cache_server_route_data';
import { redirect } from 'next/navigation';

export default async function WorkerDashboard() {
  const session = await getCachedSession();
  if (!session) redirect('/login');
  if (session.user.role !== 'worker') redirect('/');

  return <WorkerDash />;
}
