import { Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, Tooltip, XAxis, YAxis } from "recharts";

type TCustomBarChartProps = {
  data: Array<{
    name: string;
    name_short: string;
    value: number;
  }>;
}

export default function CustomBarChart({ data }: TCustomBarChartProps) {
  const labelMap = new Map(data.map((el) => {
    if (el.name === 'Total') return [el.name_short, 'Cумма'];
    return [el.name_short, el.name];
  }));

  const processedData = [] as Array<{
    name: string;
    name_short: string;
    value: number;
    prevVal: number;
  }>;
  let valueMin = 0;
  let valueMax = 0;
  data.forEach((el, index) => {
    if (el.value < valueMin) valueMin = el.value;
    if (el.value > valueMax) valueMax = el.value;

    processedData.push({
      ...el,
      name_short: el.name_short.length > 10 ? el.name_short.slice(0, 10) : el.name_short,
      prevVal: (index > 0 && index !== data.length - 1) ? processedData[index-1].value + processedData[index-1].prevVal : 0,
    });
  });
  const valueRange = Math.abs(valueMin) + Math.abs(valueMax);

  return (
    <div>
      <BarChart width={((100 * processedData.length) > 390) ? (100 * processedData.length) : 390} height={250} data={processedData}>
        {/* <CartesianGrid strokeDasharray="3 3" /> */}
        <XAxis dataKey="name_short" />
        <YAxis
          domain={[valueMin < 0 ? (dataMin: number) => dataMin - valueRange * 0.15 : 'auto', (dataMax: number) => dataMax > 0 ? (dataMax + valueRange * 0.15) : 0]}
          tick={false}
          width={0}
        />
        <Tooltip
          labelFormatter={(label) => labelMap.get(label)}
        />
        {/* <Legend /> */}
        <Bar dataKey="prevVal" stackId={'a'} fill={`transparent`} maxBarSize={20} />
        <Bar dataKey="value" stackId={'a'} fill={`${'#17598C'}`} maxBarSize={20}>
          <LabelList dataKey="value" position="top" />
          {processedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === processedData.length - 1 ? '#8DB040' : '#17598C'} />
            ))
          }
        </Bar>
      </BarChart>
    </div>
  );
}
