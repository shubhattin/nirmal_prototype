import AdminDashPage from '@/components/pages/admin/AdminDashPage';
import { getCachedSession } from '~/lib/cache_server_route_data';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
  const session = await getCachedSession();
  if (!session) redirect('/login');
  if (session.user.role !== 'admin') redirect('/');

  return <AdminDashPage />;
}

export const metadata = {
  title: 'Admin Dashboard — Nirmal Setu'
};
