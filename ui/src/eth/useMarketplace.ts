import { useMemo } from "react";
import { heatOptionAbi, kpmarketAbi } from "./abi";
import { useBlockNumber, useReadContract, useReadContracts } from "wagmi";

const MarketAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

export const useLocations = () => {
  return useReadContract({
    address: MarketAddress,
    abi: kpmarketAbi,
    functionName: "getLocations",
  });
};

export const useHeatOptions = (location: string) => {
  return useReadContract({
    address: MarketAddress,
    abi: kpmarketAbi,
    functionName: "getHeatOptionsByLocation",
    args: [location],
  });
};

type HeatOptionStatus = "open" | "expired" | "arbitrating" | "closed";

export const useHeatOption = (address: `0x${string}`) => {
  const { data: blockNumber } = useBlockNumber();

  const { data, queryKey } = useReadContracts({
    contracts: [
      {
        address,
        abi: heatOptionAbi,
        functionName: "location",
      },
      {
        address,
        abi: heatOptionAbi,
        functionName: "expiryBlock",
      },
      {
        address,
        abi: heatOptionAbi,
        functionName: "exercised",
      },
      {
        address,
        abi: heatOptionAbi,
        functionName: "totalYES",
      },
      {
        address,
        abi: heatOptionAbi,
        functionName: "totalNO",
      },
      {
        address,
        abi: heatOptionAbi,
        functionName: "winnerIsYES",
      },
      {
        address,
        abi: heatOptionAbi,
        functionName: "strikePrice",
      },
      {
        address,
        abi: heatOptionAbi,
        functionName: "arbitrationPeriodFinished",
      },
      {
        address,
        abi: heatOptionAbi,
        functionName: "arbitrationPeriod",
      },
    ],
  });

  const [expiryBlock, exercised, arbPeriod, arbFinished] = [
    data?.[1].result,
    data?.[2].result,
    data?.[8].result,
    data?.[7].result,
  ];

  const status = useMemo<HeatOptionStatus>(() => {
    if (
      !blockNumber ||
      !expiryBlock ||
      !arbPeriod ||
      arbFinished === undefined ||
      exercised === undefined
    )
      return "open";

    if (arbFinished) return "closed";
    if (blockNumber < expiryBlock) return "open";
    if (!exercised) return "expired";
    if (blockNumber < expiryBlock + arbPeriod) return "arbitrating";
    return "closed";
  }, [blockNumber, expiryBlock, arbPeriod, arbFinished, exercised]);

  return {
    location: data?.[0].result,
    expiryBlock: data?.[1].result,
    exercised: data?.[2].result,
    balancesYES:
      data?.[3].result !== undefined
        ? data?.[3].result / BigInt(10 ** 18)
        : undefined,
    balancesNO:
      data?.[4].result !== undefined
        ? data?.[4].result / BigInt(10 ** 18)
        : undefined,
    winnerIsYES: data?.[5].result,
    strikePrice: data?.[6].result,
    arbFinished: data?.[7].result,
    arbPeriod: data?.[8].result,
    status,
    queryKey,
  };
};
