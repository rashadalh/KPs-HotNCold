import React from "react";
import {
  useHeatOption,
  useHeatOptions,
  useLocations,
} from "../eth/useMarketplace";

export const LocationList = () => {
  const { data, isLoading } = useLocations();

  return (
    <div className="space-y-4 border-2 rounded-md border-gray-700 p-4">
      {data?.map((location) => (
        <div key={location} className="flex flex-col gap-y-2 justify-between">
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
    <div className="space-y-4 rounded-md p-2 bg-gray-600">
      {data?.map((ho) => <HeatOption key={ho} address={ho} />)}
    </div>
  );
};

export const HeatOption: React.FC<{ address: `0x${string}` }> = ({
  address,
}) => {
  const ho = useHeatOption(address);

  console.log(ho);

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div>foobar</div>
        <div className="text-xl">{ho.exercised}</div>
      </div>
    </div>
  );
};
