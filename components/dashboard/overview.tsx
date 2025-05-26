"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const data = [
  {
    name: "Ene",
    ingresos: 18000,
    gastos: 9000,
  },
  {
    name: "Feb",
    ingresos: 16000,
    gastos: 8500,
  },
  {
    name: "Mar",
    ingresos: 19000,
    gastos: 9500,
  },
  {
    name: "Abr",
    ingresos: 17000,
    gastos: 8000,
  },
  {
    name: "May",
    ingresos: 20000,
    gastos: 10000,
  },
  {
    name: "Jun",
    ingresos: 21000,
    gastos: 9800,
  },
];

export function Overview() {
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
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          formatter={(value) => [`$${value}`, ""]}
          labelFormatter={(label) => `Mes: ${label}`}
        />
        <Bar dataKey="ingresos" fill="#4f46e5" radius={[4, 4, 0, 0]} />
        <Bar dataKey="gastos" fill="#f43f5e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
