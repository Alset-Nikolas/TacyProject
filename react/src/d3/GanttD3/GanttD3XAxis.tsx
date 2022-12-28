import React from "react";
import moment from "moment";

import { chartConfig } from "../../utils/chartConfig";
import { fills } from "../../utils/fills";
import { dateScale, getCoordinate } from "../../utils/utilities";
import { TIntermediateDate } from "../../types";

type TGanttD3XAxisProps = {
  data?: Array<TIntermediateDate>;
  itemsCount?: number;
}

export const GanttD3XAxis = ({ data, itemsCount }: TGanttD3XAxisProps) => {
  const {
    marginTop,
    weekdays,
    months,
    daysNumber,
    startDate,
    chartHeight,
    chartWidth,
    dayWidth,
    xAxisHeight
  } = chartConfig;
  const { WHITE, RED, PALE_WHITE, GREY, BLACK } = fills;
  const dateArray = [];
  for (let i = 0; i < daysNumber; i++)
    dateArray.push(
      new Date(
        moment(startDate)
          .add(i, "days")
          .format()
      )
    );
  const arrayDateForLine = [
    ...dateArray,
    new Date(
      moment(dateArray[180])
        .add(1, "days")
        .format()
    )
  ];

  const axisLines = arrayDateForLine.map(date => {
    if (date.getDate() === 1) {
      const y1 = date.getDate() === 1 ? 0 : marginTop;
      const x = dateScale(date);
      return (
        <line
          key={+date}
          x1={x}
          y1={y1}
          x2={x}
          y2={(32 * (itemsCount || 0) + 75)}
          strokeWidth={0.5}
          stroke={BLACK}
        />
      );
    }
    return null;
  });

  const yearLabels = dateArray.map(date => {
    if (months[date.getMonth()] === 'январь' && date.getDate() === 1) {
      return (
        <text
          className="year"
          key={+date}
          x={dateScale(date)}
          dx={7}
          y={18}
          fill={BLACK}
          fontSize={16}
        >{`${date.getFullYear()}`}</text>
      );
    }
    return null;
  });

  const monthLabels = dateArray.map(date => {
    if (date.getDate() === 1/* || date.setHours(0, 0, 0, 0) === chartConfig.currentDate*/) {
      return (
        <text
          className="month"
          key={+date}
          x={dateScale(date)}
          dx={7}
          y={37}
          fill={BLACK}
          fontSize={16}
        >{`${months[date.getMonth()]}`}</text>
      );
    }
    return null;
  });

  const intermediateDatesLabels = data?.map((item) => {
    return (
      <g key={item.title+item.date}>
        <line
          x1={getCoordinate(item.date)}
          y1={40}
          x2={getCoordinate(item.date)}
          y2={(32 * (itemsCount || 0) + 78)}
          strokeWidth={1}
          stroke={BLACK}
          strokeDasharray={4}
        />
        <text
          x={getCoordinate(item.date)}
          dx={dayWidth / 2}
          y={(32 * (itemsCount || 0) + 93)}
          textAnchor="middle"
          fill={BLACK}
          fontSize={16}
        >
          {item.title}
        </text>
        <text
          x={getCoordinate(item.date)}
          dx={dayWidth / 2}
          y={(32 * (itemsCount || 0) + 118)}
          textAnchor="middle"
          fill={BLACK}
          fontSize={16}
        >
          {item.date}
        </text>
      </g>
    );
  })

  const dayLabels = dateArray.map(date => {
    const isWeekend = [5, 6].includes(date.getDay());
    return (
      <g key={+date}>
        <text
          x={dateScale(date)}
          dx={dayWidth / 2}
          y={42}
          textAnchor="middle"
          fill={isWeekend ? RED : BLACK}
          fontSize={9}
        >
          {weekdays[date.getDay()]}
        </text>
        <text
          x={dateScale(date)}
          dx={dayWidth / 2}
          y={60}
          fill={isWeekend ? RED : BLACK}
          fontSize={14}
          textAnchor="middle"
        >
          {date.getDate()}
        </text>
      </g>
    );
  });

  return (
    <g className="date">
      {/* <rect
        x={0}
        y={marginTop}
        width={chartWidth + dayWidth + 1}
        height={xAxisHeight}
        fill={BLACK}
        fillOpacity={0.5}
      /> */}
      <g>{axisLines}</g>
      <g>{yearLabels}</g>
      <g className="months">{monthLabels}</g>
      {/* <g>{dayLabels}</g>s */}
      {!!data && (
        <rect
          x={-200}
          y={(32 * (itemsCount || 0) + 73)}
          width={chartConfig.chartWidth + 300}
          height={60}
          fill={WHITE}
          
        />
      )}
      <g>{intermediateDatesLabels}</g>
      {!!data && (
        <rect
          x={-200}
          y={200}
          width={200}
          height={60}
          fill={WHITE}
        />
      )}
    </g>
  );
};
