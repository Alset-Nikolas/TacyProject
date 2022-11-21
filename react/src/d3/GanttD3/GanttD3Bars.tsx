import React from "react";
import { TStage } from '../../types';

import { chartConfig } from "../../utils/chartConfig";
import { getCoordinate, setWidth } from "../../utils/utilities";
import { fills } from "../../utils/fills";

type TGanttD3BarsProps = {
  data: Array<TStage>;
}

export const GanttD3Bars = ({ data }: TGanttD3BarsProps) => {
  const { rectHeight, rowHeight } = chartConfig;
  const { RED } = fills;
  const bars = data.map((stage, index) => {
    const marginTop = 60;
    const y = index * rowHeight + marginTop;

    // console.log(getCoordinate(stage.date_start));
    return (
      <rect
        key={stage.id}
        id={stage.id.toString()}
        x={getCoordinate(stage.date_start) < 0 ? 0 : getCoordinate(stage.date_start)}
        y={y}
        width={setWidth(getCoordinate(stage.date_start), getCoordinate(stage.date_end))}
        height={rectHeight}
        fill={RED}
      />
    );


    // const stages = trips
    //   .filter(({ tripEndsOn }) => getCoordinate(tripEndsOn) > 0)
    //   .map(({ tripStartsOn, tripEndsOn, tripNumber }) => {
    //     const tripStart = getCoordinate(tripStartsOn);
    //     const tripEnd = getCoordinate(tripEndsOn);
    //     return (
    //       <rect
    //         key={tripNumber}
    //         id={tripNumber}
    //         x={tripStart < 0 ? 0 : tripStart}
    //         y={y}
    //         width={setWidth(tripStart, tripEnd)}
    //         height={rectHeight}
    //         fill={RED}
    //       />
    //     );
    //   });

    // return (
    //   <g key={id} className="traveller-row">
    //     {travellerTrips}
    //   </g>
    // );
  });

  return <g className="gantt-chart__bars">{bars}</g>;
};
