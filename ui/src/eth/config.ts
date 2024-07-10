import { http, createConfig } from "wagmi";
import { anvil, mainnet } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const config = createConfig({
  chains: [mainnet, anvil],
  transports: {
    [anvil.id]: http("http://localhost:8545"),
    [mainnet.id]: http(),
  },
  connectors: [injected()],
});
