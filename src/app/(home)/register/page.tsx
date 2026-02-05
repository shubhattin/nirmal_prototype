import RegisterComponent from '@/components/pages/login/RegisterPage';
import { getCachedSession } from '~/lib/cache_server_route_data';
import { redirect } from 'next/navigation';

export default async function Register() {
  const session = await getCachedSession();
  if (session) redirect('/');

  return (
    <main className="space-y-6">
      <RegisterComponent />
    </main>
  );
}

export const metadata = {
  title: 'Register — Nirmal Setu'
};
