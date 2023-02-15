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
  data.forEach((el, index) => {
    processedData.push({
      ...el,
      prevVal: (index > 0 && index !== data.length - 1) ? processedData[index-1].value + processedData[index-1].prevVal : 0,
    });
  });

  return (
    <div>
      <BarChart width={((100 * processedData.length) > 390) ? (100 * processedData.length) : 390} height={250} data={processedData}>
        {/* <CartesianGrid strokeDasharray="3 3" /> */}
        <XAxis dataKey="name_short" />
        <YAxis
          domain={['auto', (dataMax: number) => (dataMax + dataMax * 0.1)]}
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
