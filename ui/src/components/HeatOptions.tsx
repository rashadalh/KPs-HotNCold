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
  const { data } = useBlockNumber();
  const seconds = useMemo(() => {
    if (!data || !ho?.expiryBlock) return undefined;

    const secs = Number((ho.expiryBlock! - data) * BigInt(13));
    return Number(secs.toString());
  }, [data, ho.expiryBlock]);
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
          <div>{seconds && hms(seconds!)}</div>
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
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const { betYes, betNo, isPending } = useBet(address, () =>
    setAmount(undefined)
  );
  const { balance } = useKpToken();

  const newAmmount = (val: string) => {
    const num = Number(val);
    if (Number.isNaN(num)) return;
    setAmount(Math.min(num, balance!));
  };

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
        className="focus-visible:ring-none bg-gradient-to-r from-cyan-400 to-red-400 rounded-md border-none w-[100px] text-center text-black placeholder:text-gray-600"
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
};
