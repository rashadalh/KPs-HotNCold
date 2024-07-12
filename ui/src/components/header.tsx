import { anvil, mainnet } from "viem/chains";
import {
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { Switch } from "./ui/switch";
import { useKpToken, useMintKp } from "~/eth/useKpToken";
import { Button } from "./ui/button";

export const Header = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const mint = useMintKp();
  const { balance } = useKpToken();

  const doConnect = () => {
    connect({
      connector: connectors[0],
      chainId: mainnet.id,
    });
  };

  const doDisconnect = () => {
    disconnect();
  };

  const switchNetwork = () => {
    if (chainId === anvil.id) {
      switchChain({
        chainId: mainnet.id,
      });
    } else {
      switchChain({
        chainId: anvil.id,
      });
    }
  };

  return (
    <div className="relative w-screen h-16 bg-gray-900 flex items-center justify-between px-4">
      <div className="text-xl">
        Katy Perry's <span className="text-red-500 font-extrabold">Hot</span>{" "}
        and <span className="text-blue-400 font-extrabold">Cold</span>
      </div>
      <div className="flex items-center">
        {isConnected ? (
          <div className="flex items-center gap-x-4">
            <div className="space-x-4">
              {!!balance && balance > 0 && (
                <span>{balance.toLocaleString()} KP</span>
              )}
              <Button
                onClick={mint}
                disabled={!address || balance === undefined || balance > 1000}
              >
                Mint Tokens
              </Button>
            </div>
            <div className="flex items-center gap-x-2">
              Local RPC
              <Switch onClick={switchNetwork} checked={chainId === anvil.id} />
            </div>
            <div className="">
              <span className="text-xl">{address?.slice(0, 8)}...</span>
            </div>
            <button
              className="bg-gray-700 px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              onClick={doDisconnect}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            className="bg-gray-700 px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            onClick={doConnect}
          >
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
};
