import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "./eth/config";
import { PropsWithChildren } from "react";

const queryClient = new QueryClient();

const Providers: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
};

export default Providers;
