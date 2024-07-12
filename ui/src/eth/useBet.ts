import { useTransactionReceipt, useWriteContract } from "wagmi";
import { heatOptionAbi } from "./abi";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useHeatOption } from "./useMarketplace";
import { useQueryClient } from "@tanstack/react-query";
import { useApprove, useKpToken } from "./useKpToken";

export const useBet = (address: `0x${string}`, confirmed: () => void) => {
  const { writeContractAsync, isPending } = useWriteContract();
  const [toastId, setToastId] = useState<string | number | undefined>();
  const [hash, setHash] = useState<`0x${string}` | undefined>(undefined);
  const { data: receipt } = useTransactionReceipt({ hash });
  const { queryKey: hoQueryKey } = useHeatOption(address);
  const { queryKey: kpQueryKey } = useKpToken();
  const qc = useQueryClient();
  const { approve } = useApprove(address);

  useEffect(() => {
    if (!receipt) return;

    toast.dismiss(toastId);
    setToastId(undefined);
    toast.success("Bet Successful!", { className: "bg-green-950" });

    setHash(undefined);
    qc.invalidateQueries({ queryKey: hoQueryKey });
    qc.invalidateQueries({ queryKey: kpQueryKey });
    confirmed();
  }, [receipt]);

  const betYes = async (amout: number) => {
    if (await approve()) return;

    const betAmt = BigInt(amout) * BigInt(10 ** 18);
    const id = toast.loading("Betting Yes...", {
      duration: Infinity,
      className: "bg-gray-900",
    });
    writeContractAsync({
      abi: heatOptionAbi,
      address,
      functionName: "betYes",
      args: [address, betAmt],
    })
      .then((r) => {
        setHash(r);
      })
      .catch((e) => {
        toast.dismiss(id);
        setToastId(undefined);
        toast.error("Failed to bet Yes!", { className: "bg-red-950" });
        console.error(e);
      });
  };

  const betNo = async (amout: number) => {
    if (await approve()) return;

    const betAmt = BigInt(amout) * BigInt(10 ** 18);
    const id = toast.loading("Betting No...", {
      duration: Infinity,
      className: "bg-gray-900",
    });
    writeContractAsync({
      abi: heatOptionAbi,
      address,
      functionName: "betNo",
      args: [address, betAmt],
    })
      .then((r) => {
        setHash(r);
      })
      .catch((e) => {
        toast.dismiss(id);
        setToastId(undefined);
        toast.error("Failed to bet No!", { className: "bg-red-950" });
        console.error(e);
      });
  };

  return { betYes, betNo, isPending: isPending || (hash && !receipt) };
};
