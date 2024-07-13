import { useMemo, useRef } from "react";
import { useResizeObserver } from "usehooks-ts";
import { motion } from "framer-motion";

type HeatBetsProps = {
  yes: bigint;
  no: bigint;
  expanded?: boolean;
};

export const HeatBets: React.FC<HeatBetsProps> = ({ yes, no, expanded }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { width = 0 } = useResizeObserver({
    ref,
  });

  const portion = useMemo(() => Number(yes) / Number(yes + no), [yes, no]);

  const sizes = useMemo(() => {
    if (Number.isNaN(portion)) return { no: 0, yes: 0 };
    if (width === 0) return { no: 0, yes: 0 };
    if (portion === 0.5) return { no: width * 0.025, yes: width * 0.025 };
    if (portion > 0.5) {
      return { no: 0, yes: (portion - 0.5) * width };
    } else {
      return { no: (0.5 - portion) * width, yes: 0 };
    }
  }, [width, portion]);

  return (
    <div className="absolute w-full h-4 -ml-4">
      <div
        className="absolute w-1/2 h-4 bg-gray-500 mx-auto left-0 right-0 rounded-full"
        ref={ref}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: sizes.no }}
          transition={{ ease: "easeInOut", duration: 0.75 }}
          className="rounded-l-full absolute mx-auto h-4 right-1/2 bg-cyan-500"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: sizes.yes }}
          transition={{ ease: "easeInOut", duration: 0.75 }}
          className="rounded-r-full absolute mx-auto h-4 left-1/2 bg-red-500"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: expanded ? 1 : 0 }}
          className="-translate-y-1 ml-2 text-cyan-200 absolute"
        >
          {!!no && no.toLocaleString()}
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: expanded ? 1 : 0 }}
          className="-translate-y-1 mr-2 text-red-200 absolute right-0"
        >
          {!!yes && yes.toLocaleString()}
        </motion.div>
      </div>
      <div className="absolute mx-auto w-[2px] h-4 left-0 right-0 bg-gray-300" />
    </div>
  );
};
