import LoginComponent from '@/components/pages/login/LoginPage';
import { redirect } from 'next/navigation';
import { getCachedSession } from '~/lib/cache_server_route_data';

export default async function Login() {
  const session = await getCachedSession();
  if (session) redirect('/');

  return (
    <main className="space-y-6">
      <LoginComponent />
    </main>
  );
}

export const metadata = {
  title: 'Login — Nirmal Setu'
};
