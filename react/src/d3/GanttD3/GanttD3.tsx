import React, { FC, useEffect, useRef } from "react";
import { event, select } from "d3-selection";
import { zoom, zoomIdentity, zoomTransform } from "d3-zoom";
import { GanttD3XAxis } from "./GanttD3XAxis";
import { GanttD3Bars } from "./GanttD3Bars";
import { GanttD3YAxis } from "./GanttD3YAxis";
import { getTouchObject } from "../../utils/utilities";
import { chartConfig } from "../../utils/chartConfig";
import classes from "../styles/Gantt.module.sass";
import { TIntermediateDate, TStage } from "../../types";

type TGantD3Props = {
  data: Array<{
    name: string;
    start: string;
    end: string;
    id: number;
  }>;
  intermediateDates?: Array<TIntermediateDate>;
  startDate: Date;
  endDate: Date;
  daysNumber: number;
};

export function GanttD3({ data, intermediateDates, startDate, endDate, daysNumber }: TGantD3Props) {
  const { gantt, gantt__title, gantt__chart } = classes;
  const { lineWidth, yAxisWidth, defaultTranslate } = chartConfig;
  let chartWidth = chartConfig.dayWidth * daysNumber + chartConfig.lineWidth;
  chartWidth = chartWidth < 862 ? 862 : chartWidth;
  

  const ganttContainerRef = useRef(null);
  const svgRef = useRef(null);
  const scrollGroupRef = useRef(null);


  const scrollXDisabled = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isXPanRef = useRef(false);
  const isYPanRef = useRef(false);

  const onTouchStart = () => {
    const touch = getTouchObject(event);
    startXRef.current = touch.pageX;
    startYRef.current = touch.pageY;
  };

  const onTouchMove = () => {
    const touch = getTouchObject(event);
    const diffX = startXRef.current - touch.pageX;
    const diffY = startYRef.current - touch.pageY;

    if (diffX >= 10 || diffX <= -10) isXPanRef.current = true;
    if (diffY >= 3 || diffY <= -3) isYPanRef.current = true;

    if (!isXPanRef.current && isYPanRef.current && !scrollXDisabled.current) {
      select(ganttContainerRef.current).on(".zoom", null);
      scrollXDisabled.current = true;
    }
    if (scrollXDisabled) window.scrollBy(0, diffY);
  };

  const onTouchEnd = (zoomBehavior: any) => {
    select(ganttContainerRef.current).call(zoomBehavior);
    scrollXDisabled.current = false;
    isXPanRef.current = false;
    isYPanRef.current = false;
  };

  /**
   * Задаёт координаты положения скролла и точки его отсановки
   * @param scrollGroup
   * @param ganttContainer
   * @returns {null}
   */
  const onScroll = (scrollGroup: any, ganttContainer: any, d3Zoom: any) => {
    const ganttContainerWidth = ganttContainer.getBoundingClientRect().width;
    const marginLeft = yAxisWidth + lineWidth;
    let transform = zoomTransform(scrollGroup.node());
    const { type, deltaY, wheelDeltaX } = event;
    // const maxStartTranslate = chartWidth / 2;
    // const maxEndTranslate = ganttContainerWidth - chartWidth / 2 - marginLeft;

    const maxX = marginLeft;
    const minX = ganttContainerWidth - chartWidth > maxX ? maxX : ganttContainerWidth - chartWidth;

    if (type === "wheel") {
      if (deltaY !== 0) return null;
      transform.applyX(transform.x + wheelDeltaX);
    }
    // transform.applyX(Math.max(transform.x, maxEndTranslate));
    // transform.applyX(Math.min(transform.x, maxStartTranslate));
    // transform.x = Math.max(transform.x, maxEndTranslate);
    // transform.x = Math.min(transform.x, maxStartTranslate);
    // console.log(transform.applyX(Math.max(transform.x, maxEndTranslate)));
    // transform = transform.translate(Math.max(transform.x, maxEndTranslate), 0);
    // transform = transform.translate(Math.min(transform.x, maxStartTranslate), 0);
    const t = zoomIdentity;

    if (transform.x > maxX) {
      transform = transform.translate(maxX - transform.x, 0);
      select(ganttContainer).call(d3Zoom.transform, zoomIdentity.translate(transform.x, 0));

      // t.translate(maxX - transform.x, 0);
    }
    if (transform.x < minX) {
      transform = transform.translate(minX - transform.x, 0);
      // t.translate(minX - transform.x, 0);
      select(ganttContainer).call(d3Zoom.transform, zoomIdentity.translate(transform.x, 0));

    }
    const translateX = transform.x;
    // if (translateX > maxStartTranslate) translateX = maxStartTranslate;
    // if (translateX < maxEndTranslate) translateX = maxEndTranslate;

    scrollGroup.attr("transform", `translate( ${translateX} , 0)`);

  };

  useEffect(() => {
    const scrollGroup = select(scrollGroupRef.current);
    const ganttContainer = ganttContainerRef.current;

    const d3Zoom = zoom()
      .scaleExtent([1, 1])
      .on("zoom", (e, d) => {
        onScroll(scrollGroup, ganttContainer, d3Zoom)
      }) as any;

    select(ganttContainer)
      .call(d3Zoom)
      .on("touchstart", onTouchStart, true)
      .on("touchmove", onTouchMove, true)
      .on(
        "touchend",
        () => {
          onTouchEnd(d3Zoom);
        },
        true
      )
      .on("wheel.zoom", () => {
        onScroll(scrollGroup, ganttContainer,d3Zoom);
      });

    select(ganttContainer).call(d3Zoom.transform, zoomIdentity.translate(defaultTranslate, 0));

    scrollGroup.attr("transform", `translate(${defaultTranslate} , 0)`);
  });

  return (
    <div ref={ganttContainerRef} className={gantt}>
      {/* <div className={gantt__title}>D3</div> */}
      <svg className={gantt__chart} ref={svgRef}
        style={{ height: 135 + 32 * (data.length || 0) }}
      >
        <g
          className="scroll" 
          ref={scrollGroupRef}
        >
          <GanttD3Bars
            data={data}
            chartWidth={chartWidth}
            startDate={startDate}
            endDate={endDate}
          />
          <GanttD3XAxis
            data={intermediateDates}
            itemsCount={data.length}
            startDate={startDate}
            endDate={endDate}
            daysNumber={daysNumber}
          />
        </g>
        <GanttD3YAxis data={data} itemsCount={data.length} />
      </svg>
    </div>
  );
}
