import React, { useMemo, useRef, useState } from "react";
import {
  useHeatOption,
  useHeatOptions,
  useLocations,
} from "../eth/useMarketplace";
import { useBlockNumber } from "wagmi";
import { hms } from "~/lib/hms";
import { HeatBets } from "./HeatBets";
import { useOnClickOutside } from "usehooks-ts";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useBet } from "~/eth/useBet";
import { useKpToken } from "~/eth/useKpToken";
import { useExercise } from "~/eth/useExercise";
import { RefreshCw } from "lucide-react";

export const LocationList = () => {
  const { data, isLoading } = useLocations();

  return (
    <div className="space-y-4 rounded-md">
      {data?.map((location) => (
        <div
          key={location}
          className="flex flex-col gap-y-2 justify-between border-2 border-gray-700 p-4 rounded-md"
        >
          <div className="text-xl">{location}</div>
          <HeatOptionList location={location} />
        </div>
      ))}
      {!isLoading && !data?.length && (
        <div className="text-xl">No locations found</div>
      )}
    </div>
  );
};

export const HeatOptionList: React.FC<{ location: string }> = ({
  location,
}) => {
  const { data } = useHeatOptions(location);

  return (
    <div className="rounded-md bg-gray-600 divide-y overflow-clip">
      {data?.map((ho) => <HeatOption key={ho} address={ho} />)}
    </div>
  );
};

export const HeatOption: React.FC<{ address: `0x${string}` }> = ({
  address,
}) => {
  const ho = useHeatOption(address);
  const { data: blockNumber } = useBlockNumber();
  const seconds = useMemo(() => {
    if (!blockNumber || !ho?.expiryBlock) return undefined;

    const secs = Number((ho.expiryBlock! - blockNumber) * BigInt(13));
    return Number(secs.toString());
  }, [blockNumber, ho.expiryBlock]);
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  useOnClickOutside(ref, () => setOpen(false));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ ease: "easeInOut", duration: 0.75 }}
      ref={ref}
      onClick={() => setOpen(true)}
    >
      <div className="relative flex justify-between h-12 items-center px-4 py-8">
        <div className="text-2xl">{ho.strikePrice?.toString()}°</div>
        <HeatBets yes={ho.balancesYES!} no={ho.balancesNO!} expanded={open} />
        <div className="text-right">
          {ho.status === "open" ? (
            <div>{seconds && hms(seconds!)}</div>
          ) : ho.status === "expired" ? (
            <div className="text-red-500">Expired</div>
          ) : ho.status === "arbitrating" ? (
            <div className="text-red-500">In Arbitration</div>
          ) : (
            <div className="text-green-500">Closed</div>
          )}
        </div>
      </div>

      <motion.div
        initial={{ height: 0 }}
        animate={{ height: open ? "auto" : 0 }}
        transition={{ ease: "easeInOut", delay: open ? 0 : 0.1 }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: open ? 1 : 0 }}
          transition={{ ease: "easeInOut", delay: open ? 0.1 : 0 }}
        >
          <HeatOptionAction address={address} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export const HeatOptionAction: React.FC<{ address: `0x${string}` }> = ({
  address,
}) => {
  const ho = useHeatOption(address);
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const { betYes, betNo, isPending } = useBet(address, () =>
    setAmount(undefined)
  );
  const { balance } = useKpToken();
  const { exercise, isPending: exercisePending } = useExercise(address);
  const { data: blockNumber } = useBlockNumber();

  const newAmmount = (val: string) => {
    const num = Number(val);
    if (Number.isNaN(num)) return;
    setAmount(Math.min(num, balance!));
  };

  if (ho.status === "open") {
    return (
      <div className="h-12 flex justify-center items-center gap-x-4 pb-2">
        <Button
          onClick={() => betNo(amount!)}
          disabled={!amount}
          className="bg-cyan-500 hover:bg-cyan-300"
        >
          Bet Colder
        </Button>
        <Input
          placeholder="1,000"
          disabled={isPending}
          value={amount || ""}
          onChange={(e) => newAmmount(e.target.value)}
          className="focus-visible:ring-none bg-gradient-to-r from-cyan-600 to-red-400 rounded-md border-none w-[100px] text-center text-black placeholder:text-gray-600"
        />
        <Button
          onClick={() => betYes(amount!)}
          disabled={!amount}
          className="bg-red-500 hover:bg-red-300"
        >
          Bet Hotter
        </Button>
      </div>
    );
  } else if (ho.status === "expired") {
    return (
      <div className="h-12 flex justify-center items-center gap-x-4 pb-2">
        <Button onClick={exercise} disabled={exercisePending}>
          {exercisePending ? (
            <RefreshCw className="size-4 animate-spin" />
          ) : (
            "Exercise"
          )}
        </Button>
      </div>
    );
  } else if (ho.status === "arbitrating") {
    return (
      <div className="h-12 flex justify-center items-center gap-x-4 pb-2">
        <div className="text-red-500">
          {hms(
            Number(
              (blockNumber || BigInt(0)) -
                ho.arbPeriod! +
                ho.expiryBlock! * BigInt(13)
            )
          )}
        </div>
      </div>
    );
  }
};
