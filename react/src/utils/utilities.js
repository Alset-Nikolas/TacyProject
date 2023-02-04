import { scaleTime } from "d3-scale";

import { chartConfig } from "./chartConfig";

/**
 * Преобразует дату в координату
 * @param date
 * @returns {number|*}
 */
export const dateScale = (date, chartWidth, startDate, endDate) => {
  // const { startDate, endDate } = chartConfig;
  const scale = scaleTime()
    .domain([startDate, endDate])
    .range([0, chartWidth]);
  return scale(date);
};

/**
 * Рассчитывает ширину красных полос графика
 * @param tripStartCoordinate
 * @param tripEndCoordinate
 * @returns {number|*}
 */
export const setWidth = (tripStartCoordinate, tripEndCoordinate, chartWidth) => {
  const { dayWidth } = chartConfig;
  let resultTripStart, resultTripEnd;
  const startChartCoordinate = 0;
  const endChartCoordinate = chartWidth;

  if (tripStartCoordinate < startChartCoordinate)
    resultTripStart = startChartCoordinate;
  else resultTripStart = tripStartCoordinate;

  if (tripEndCoordinate > endChartCoordinate)
    resultTripEnd = endChartCoordinate;
  else resultTripEnd = tripEndCoordinate;

  if (resultTripEnd - resultTripStart === 0) {
    return dayWidth + 1;
  }
  return resultTripEnd - resultTripStart - 1;
};

/**
 * Принимает строку с датой, возвращает координату
 * @param dateString
 * @returns {number|*}
 */
export const getCoordinate = (dateString, chartWidth, startDate, endDate) =>
  dateScale(Date.parse(dateString), chartWidth, startDate, endDate);

/**
 * @description возвращает объект касания
 * @param e - событие касания
 * @return Object
 */
export const getTouchObject = e => e.changedTouches[0];
