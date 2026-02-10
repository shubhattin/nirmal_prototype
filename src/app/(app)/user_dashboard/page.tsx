import UserDashPage from '@/components/pages/user/UserDashPage';
import { getCachedSession } from '~/lib/cache_server_route_data';
import { redirect } from 'next/navigation';

export default async function UserDashboard() {
  const session = await getCachedSession();
  if (!session) {
    redirect('/login');
  }
  if (session.user.role !== 'user') {
    redirect('/');
  }

  return <UserDashPage />;
}

export const metadata = {
  title: 'User Dashboard — Nirmal Setu'
};
