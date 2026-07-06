import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function TeamChart({ roleData }: { roleData: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={roleData} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={3}>
          {roleData.map((d: any) => <Cell key={d.name} fill={d.color} />)}
        </Pie>
        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
