import './globals.css';
import './app.scss';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import { Metadata } from 'next';
import TRPCProvider from '~/api/TRPCProvider';
import { AppContextProvider } from '~/components/AddDataContext';
import { cookies } from 'next/headers';
import { z } from 'zod';
import NavBar from '~/components/pages/NavBar';
import { getCachedSession } from '~/lib/cache_server_route_data';
import FloatingParticles from '~/components/FloatingParticles';

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCachedSession();

  return (
    <html lang="en" suppressHydrationWarning className="dark" style={{ colorScheme: 'dark' }}>
      <body
        className={cn(
          'antialiased',
          'overflow-y-scroll bg-black pb-12 text-white sm:px-2 sm:pb-163 lg:px-3 xl:px-4 xl:pb-28 2xl:px-4 2xl:pb-32'
        )}
      >
        <ThemeProvider
          attribute={['class']}
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TRPCProvider>
            <AppContextProvider initialSession={session}>
              {children}
              <Toaster richColors={true} position="bottom-center" />
            </AppContextProvider>
          </TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

// export const runtime = 'edge';

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico'
  }
};
