import { Tooltip } from "@mui/material";
import { TStage } from "../../types";
import { chartConfig } from "../../utils/chartConfig";
import { fills } from "../../utils/fills";

import classes from '../styles/Gantt.module.sass'; 

type TGanttD3YAxisProps = {
  data: Array<{
    name: string;
    start: string;
    end: string;
    id?: number;
  }>;
  itemsCount?: number;
}

export const GanttD3YAxis = ({ data, itemsCount }: TGanttD3YAxisProps) => {
  const {
    rowHeight,
    marginTop,
    yAxisWidth,
    chartHeight,
    xAxisHeight
  } = chartConfig;

  const { GREY, WHITE, BLACK } = fills;

  const { text } = classes;

  const stagesList = data.map(({ id, name }, i) => {
    const y = i * rowHeight + marginTop + xAxisHeight;
    const stageTitle = `${name}`;
    const fill = (i % 2) ? GREY : 'rgba(255, 255, 255, 0.5)';
    return (
      <g
      key={id}
      
      >
      <rect
        x={0}
        y={y - 20}
        width={350}
        height={32}
        fill={fill}
      />
      <Tooltip
        title={`${stageTitle}`}
        placement="bottom-start"
      >
      <text
        x={10}
        y={y}
        fill={BLACK}
        className={text}
        width={120}
        style={{ textOverflow: 'ellipsis' }}
      >
        {stageTitle}
      </text>
      </Tooltip>
      </g>
    );
  });

  return (
    <g clipPath="url(#clip1)">
      <rect x={0} y={0} width={yAxisWidth} height={chartHeight-200 + 32 * (itemsCount || 0)} fill={WHITE} />
      <rect
        x={0}
        y={0}
        width={yAxisWidth}
        height={xAxisHeight + 32 * (itemsCount || 0)}
        fill={GREY}
      />
      <g>
      <svg x="0" y="0" width={yAxisWidth} height={chartHeight-200 + 32 * (itemsCount || 0)}>

          {stagesList}

        </svg>
      </g>
    </g>
  );
};
