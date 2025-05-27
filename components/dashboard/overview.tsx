"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface OverviewProps {
  data: Array<{
    name: string;
    ingresos: number;
    gastos: number;
  }>;
}

export function Overview({ data }: OverviewProps) {
  // If no data is provided, show a message
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
        <p>No hay datos disponibles para mostrar</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip
          formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
          labelFormatter={(label) => `Mes: ${label}`}
        />
        <Bar dataKey="ingresos" fill="#4f46e5" radius={[4, 4, 0, 0]} />
        <Bar dataKey="gastos" fill="#f43f5e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
