import { useTransactionReceipt, useWriteContract } from "wagmi";
import { useHeatOption } from "./useMarketplace";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { heatOptionAbi } from "./abi";
import { useQueryClient } from "@tanstack/react-query";

export const useExercise = (address: `0x${string}`) => {
  const ho = useHeatOption(address);
  const { writeContractAsync, isPending } = useWriteContract();
  const [hash, setHash] = useState<`0x${string}` | undefined>(undefined);
  const { data: receipt } = useTransactionReceipt({ hash });
  const [toastId, setToastId] = useState<string | number | undefined>(
    undefined
  );
  const qc = useQueryClient();

  useEffect(() => {
    if (!receipt) return;
    toast.dismiss(toastId);
    setToastId(undefined);
    setHash(undefined);
    toast.success("Exercised", {
      className: "bg-green-950",
    });
    qc.invalidateQueries({ queryKey: ho.queryKey });
  }, [receipt]);

  const exercise = async () => {
    if (ho.status !== "expired") return;

    const id = toast.loading("Exercising...", {
      className: "bg-gray-900",
      duration: Infinity,
    });
    setToastId(id);
    await writeContractAsync({
      address,
      abi: heatOptionAbi,
      functionName: "exerciseOption",
    })
      .then((r) => {
        setHash(r);
      })
      .catch((e) => {
        toast.dismiss(id);
        setToastId(undefined);
        toast.error("Exercise failed", {
          className: "bg-red-950",
        });
        console.error(e);
      });
  };

  return {
    exercise,
    isPending: isPending || (hash !== undefined && receipt === undefined),
  };
};
