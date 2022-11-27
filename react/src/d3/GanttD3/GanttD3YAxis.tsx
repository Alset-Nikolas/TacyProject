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
    return (
      <text
        key={id}
        x={10}
        y={y}
        fill={BLACK}
        className={text}
      >
        {stageTitle}
      </text>
    );
  });

  return (
    <g>
      <rect x={0} y={0} width={yAxisWidth} height={chartHeight-200 + 32 * (itemsCount || 0)} fill={GREY} />
      <rect
        x={0}
        y={marginTop}
        width={yAxisWidth}
        height={xAxisHeight + 32 * (itemsCount || 0)}
        fill={GREY}
        fillOpacity={0.5}
      />
      <g>
        {stagesList.length ?
          stagesList
          :
          <text
            x={10}
            y={marginTop + xAxisHeight}
            fill={BLACK}
            className={text}
          >
            Список пуст
          </text>
          }
      </g>
    </g>
  );
};
