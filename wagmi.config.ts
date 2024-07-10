import { defineConfig } from "@wagmi/cli";
import { foundry } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "ui/src/eth/abi.ts",
  contracts: [],
  plugins: [foundry()],
});
