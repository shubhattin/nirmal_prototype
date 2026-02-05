import { Metadata } from 'next';
import NavBar from '~/components/pages/NavBar';

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}

// export const runtime = 'edge';

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico'
  }
};
