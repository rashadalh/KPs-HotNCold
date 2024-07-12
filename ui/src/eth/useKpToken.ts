import {
  useAccount,
  useReadContract,
  useReadContracts,
  useTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { standardTokenAbi } from "./abi";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const kpAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export const useKpToken = () => {
  const { address } = useAccount();
  const data = useReadContracts({
    contracts: [
      {
        address: kpAddress,
        abi: standardTokenAbi,
        functionName: "balanceOf",
        args: [address!],
      },
      {
        address: kpAddress,
        abi: standardTokenAbi,
        functionName: "decimals",
      },
    ],
    query: {
      enabled: !!address,
    },
  });

  const balance = useMemo(() => {
    if (!data.data) return undefined;
    const decimals = data.data[1].result;
    const bigBalance = data.data[0]?.result;
    if (!decimals || bigBalance === undefined) return undefined;

    const bal = Number(bigBalance / BigInt(10 ** decimals));
    return bal;
  }, [data.data]);

  return { ...data, balance };
};

export const useMintKp = () => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract({});
  const { queryKey } = useKpToken();
  const [hash, setHash] = useState<`0x${string}` | undefined>(undefined);
  const [toastId, setToastId] = useState<string | number | undefined>(
    undefined
  );
  const { data } = useTransactionReceipt({ hash });
  const qc = useQueryClient();

  useEffect(() => {
    if (!data) return;
    toast.dismiss(toastId);
    setToastId(undefined);
    toast.success("Minted KP!", { className: "bg-green-950" });
    qc.invalidateQueries({ queryKey });
  }, [data]);

  const mint = async () => {
    if (!address) return;

    const id = toast.loading("Minting KP...", {
      duration: Infinity,
      className: "bg-gray-900",
    });
    setToastId(id);
    writeContractAsync({
      address: kpAddress,
      abi: standardTokenAbi,
      functionName: "mint",
      args: [address, BigInt(100_000) * BigInt(10 ** 18)],
    })
      .then((r) => {
        setHash(r);
      })
      .catch(() => {
        toast.dismiss(id);
        setToastId(undefined);
        toast.error("Failed to mint KP!", { className: "bg-red-950" });
      });
  };

  return mint;
};

export const useApprove = (address: `0x${string}`) => {
  const [hash, setHash] = useState<`0x${string}` | undefined>(undefined);
  const [toastId, setToastId] = useState<string | number | undefined>(
    undefined
  );
  const { data: receipt } = useTransactionReceipt({ hash });
  const { address: userAddress } = useAccount();
  const qc = useQueryClient();
  const { data: allowance, queryKey } = useReadContract({
    abi: standardTokenAbi,
    address: kpAddress,
    functionName: "allowance",
    args: [userAddress!, address],
    query: {
      enabled: !!userAddress,
    },
  });

  useEffect(() => {
    if (!receipt) return;

    toast.dismiss(toastId);
    setToastId(undefined);
    toast.success("Approved KP!", { className: "bg-green-950" });

    setHash(undefined);
    qc.invalidateQueries({ queryKey });
  }, [receipt]);

  const { writeContractAsync, isPending } = useWriteContract();

  const approve = async () => {
    if (!!allowance) return false;

    const id = toast.loading("Approving KP...", {
      duration: Infinity,
      className: "bg-gray-900",
    });
    await writeContractAsync({
      abi: standardTokenAbi,
      address: kpAddress,
      functionName: "approve",
      args: [address, BigInt(100_000_000) * BigInt(10 ** 18)],
    })
      .then((r) => {
        setHash(r);
      })
      .catch(() => {
        toast.dismiss(id);
        setToastId(undefined);
        setHash(undefined);
        toast.error("Failed to approve KP!", { className: "bg-red-950" });
      });
    return true;
  };

  return { approve, isPending: isPending || (hash && !receipt) };
};
