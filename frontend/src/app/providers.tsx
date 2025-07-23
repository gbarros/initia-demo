'use client';

import { ReactNode, useState, useEffect } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as JotaiProvider } from 'jotai';
import { InitiaWidgetProvider } from '@initia/widget-react';
import chain from '../lib/chain';

const config = createConfig({
  chains: [chain],
  transports: {
    [chain.id]: http(),
  },
});

const queryClient = new QueryClient();

export default function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <JotaiProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
                    {mounted ? <InitiaWidgetProvider>{children}</InitiaWidgetProvider> : <>{children}</>}
        </QueryClientProvider>
      </WagmiProvider>
    </JotaiProvider>
  );
}
