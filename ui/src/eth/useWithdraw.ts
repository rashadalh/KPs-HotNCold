import {
  useAccount,
  useReadContracts,
  useTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { heatOptionAbi } from "./abi";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useKpToken } from "./useKpToken";

// withdraw yes
// uint256 winnerPayout = (totalNO + totalYES) * balancesYES[_bettor] / totalYES;
// withdraw no
// uint256 winnerPayout = (totalNO + totalYES) * balancesNO[_bettor] / totalNO;

export const useWinnings = (address: `0x${string}`) => {
  const { address: userAddress } = useAccount();

  const { data, ...resp } = useReadContracts({
    contracts: [
      {
        address,
        abi: heatOptionAbi,
        functionName: "balancesYES",
        args: [userAddress!],
      },
      {
        address,
        abi: heatOptionAbi,
        functionName: "balancesNO",
        args: [userAddress!],
      },
      {
        address,
        abi: heatOptionAbi,
        functionName: "totalYES",
        args: [],
      },
      {
        address,
        abi: heatOptionAbi,
        functionName: "totalNO",
        args: [],
      },
    ],
    query: {
      enabled: !!userAddress,
    },
  });

  const balYes = data?.[0].result;
  const balNo = data?.[1].result;
  const totalYes = data?.[2].result;
  const totalNo = data?.[3].result;

  const withdrawableYes = useMemo(() => {
    console.table({ totalYes, balYes, totalNo });
    if (totalYes && balYes && totalNo) {
      return ((totalYes + totalNo) * balYes) / totalYes;
    }
  }, [totalNo, totalYes, balYes]);
  const withdrawableNo = useMemo(() => {
    console.table({ totalYes, balNo, totalNo });
    if (totalYes && balNo && totalNo) {
      return ((totalYes + totalNo) * balNo) / totalNo;
    }
  }, [totalNo, totalYes, balNo]);

  return { withdrawableYes, withdrawableNo, ...resp };
};

export const useWithdraw = (address: `0x${string}`) => {
  const { address: userAddress } = useAccount();
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [toastId, setToastId] = useState<string | number | undefined>();
  const { data: receipt } = useTransactionReceipt({ hash });
  const { writeContractAsync, reset, isPending } = useWriteContract();
  const { queryKey: winningsQueryKey } = useWinnings(address);
  const { queryKey: kpTokenQueryKey } = useKpToken();
  const qc = useQueryClient();

  useEffect(() => {
    if (!receipt) return;

    toast.dismiss(toastId);
    toast.success("Successfully withdrawn", {
      className: "bg-green-900",
    });
    setHash(undefined);
    reset();
    qc.invalidateQueries({ queryKey: winningsQueryKey });
    qc.invalidateQueries({ queryKey: kpTokenQueryKey });
  }, [receipt]);

  const withdrawYes = async () => {
    const id = toast.loading("Withdrawing Yes...", {
      className: "bg-gray-900",
      duration: Infinity,
    });
    setToastId(id);

    await writeContractAsync({
      address,
      abi: heatOptionAbi,
      functionName: "withdrawPayoutYES",
      args: [userAddress!],
    })
      .then((tx) => setHash(tx))
      .catch((e) => {
        toast.dismiss(id);
        toast.error("Error withdrawing Yes", {
          className: "bg-red-900",
        });
        console.error(e);
      });
  };

  const withdrawNo = async () => {
    const id = toast.loading("Withdrawing Yes...", {
      className: "bg-gray-900",
      duration: Infinity,
    });
    setToastId(id);

    await writeContractAsync({
      address,
      abi: heatOptionAbi,
      functionName: "withdrawPayoutNO",
      args: [userAddress!],
    })
      .then((tx) => setHash(tx))
      .catch((e) => {
        toast.dismiss(id);
        toast.error("Error withdrawing Yes", {
          className: "bg-red-900",
        });
        reset();
        console.error(e);
      });
  };

  return {
    withdrawYes,
    withdrawNo,
    isPending: isPending || (!!hash && !receipt),
  };
};
