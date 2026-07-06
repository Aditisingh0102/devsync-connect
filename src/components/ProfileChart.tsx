import React from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border p-3 rounded-xl shadow-lg text-sm z-50 min-w-[150px]">
        <p className="font-semibold mb-1">{label}</p>
        <p className="text-primary font-medium">{data.c} Contributions</p>
        {data.projects && data.projects.length > 0 && (
          <div className="mt-2 space-y-1">
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Projects</p>
            <ul className="list-disc pl-4 text-xs text-muted-foreground">
              {data.projects.map((p: string, i: number) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function ProfileChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 12, right: 0, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="m" stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }} />
        <Bar dataKey="c" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
