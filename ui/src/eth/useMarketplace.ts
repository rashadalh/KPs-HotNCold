import { heatOptionAbi, kpmarketAbi } from "./abi";
import { useReadContract, useReadContracts } from "wagmi";

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

export const useHeatOption = (address: `0x${string}`) => {
  const { data } = useReadContracts({
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
        functionName: "balancesYES",
      },
      {
        address,
        abi: heatOptionAbi,
        functionName: "balancesNO",
      },
      {
        address,
        abi: heatOptionAbi,
        functionName: "winnerIsYES",
      },
    ],
  });

  return {
    location: data?.[0].result,
    expiryBlock: data?.[1].result,
    exercised: data?.[2].result,
    balancesYES: data?.[3].result,
    balancesNO: data?.[4].result,
    winnerIsYES: data?.[5].result,
  };
};
