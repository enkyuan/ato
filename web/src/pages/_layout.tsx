import '../styles.css';

import type { ReactNode } from 'react';

import { Header } from '../components/header';
import { ClientToaster } from '../components/client-toaster';

type RootLayoutProps = { children: ReactNode };

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <body>
      <div className="root font-['Geist']">
        <meta name="description" content="Where ato? Your todo list is here." />
        <link rel="icon" type="image/png" href="/images/favicon.png" />
        <ClientToaster />
        <Header />
        <main className="m-6 flex items-center *:min-h-64 *:min-w-64 lg:m-0 lg:min-h-svh lg:justify-center">
          {children}
        </main>
      </div>
    </body>
  );
}
