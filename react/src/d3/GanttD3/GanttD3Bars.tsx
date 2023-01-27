import React from "react";
import { TStage } from '../../types';

import { chartConfig } from "../../utils/chartConfig";
import { getCoordinate, setWidth } from "../../utils/utilities";
import { fills } from "../../utils/fills";
import { Tooltip } from "@mui/material";

type TGanttD3BarsProps = {
  data: Array<{
    name: string;
    start: string;
    end: string;
    id: number;
  }>;
}

export const GanttD3Bars = ({ data }: TGanttD3BarsProps) => {
  const { rectHeight, rowHeight } = chartConfig;
  const { RED, GREY, WHITE } = fills;
  const bars = data.map((stage, index) => {
    const marginTop = 60;
    const y = index * rowHeight + marginTop;
    const barBackground = index % 2 ? GREY : 'rgba(255, 255, 255, 0.5)';

    // console.log(getCoordinate(stage.date_start));
    return (
      <Tooltip
        key={stage.id}
        title={`Начало: ${stage.start} Окончание: ${stage.end}`}
        placement="bottom-start"
      >
        <>
        <rect
          id={stage.id.toString()}
          x={0}
          y={y-10}
          width={chartConfig.chartWidth}
          height={32}
          fill={barBackground}
        />
        <rect
          id={stage.id.toString()}
          x={getCoordinate(stage.start) < 0 ? 0 : getCoordinate(stage.start)}
          y={y}
          width={setWidth(getCoordinate(stage.start), getCoordinate(stage.end))}
          height={rectHeight}
          fill={RED}
        />
        </>
      </Tooltip>
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
