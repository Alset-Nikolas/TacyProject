import { Bar, BarChart, CartesianGrid, LabelList, Legend, Tooltip, XAxis, YAxis } from "recharts";

type TCustomBarChartProps = {
  data: Array<any>;
}

export default function CustomBarChart({ data }: TCustomBarChartProps) {
  const labelMap = new Map(data.map((el) => [el.name_short, el.name]));
  return (
    <div>
      <BarChart width={390} height={250} data={data}>
        {/* <CartesianGrid strokeDasharray="3 3" /> */}
        <XAxis dataKey="name_short" />
        <YAxis />
        <Tooltip
          labelFormatter={(label) => labelMap.get(label)}
        />
        {/* <Legend /> */}
        <Bar dataKey="value" fill={`${'#17598C'}`} maxBarSize={20}>
          <LabelList dataKey="value" position="top" />
        </Bar>
      </BarChart>
    </div>
  );
}
