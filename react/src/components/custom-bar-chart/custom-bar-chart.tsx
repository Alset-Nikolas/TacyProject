import { Bar, BarChart, CartesianGrid, LabelList, Legend, Tooltip, XAxis, YAxis } from "recharts";

type TCustomBarChartProps = {
  data: Array<any>;
}

export default function CustomBarChart({ data }: TCustomBarChartProps) {
  return (
    <div>
      <BarChart width={390} height={250} data={data}>
        {/* <CartesianGrid strokeDasharray="3 3" /> */}
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        {/* <Legend /> */}
        <Bar dataKey="value" fill={`${'#17598C'}`} maxBarSize={20}>
          <LabelList dataKey="value" position="top" />
        </Bar>
      </BarChart>
    </div>
  );
}
