import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface TaskProgressChartProps {
  completed: number;
  pending: number;
}

export default function TaskProgressChart({ completed, pending }: TaskProgressChartProps) {
  const data = [
    { name: 'รอดำเนินการ', value: pending, color: 'var(--accent)' },
    { name: 'เสร็จสิ้น', value: completed, color: 'var(--success)' },
  ];

  return (
    <div className="w-full h-[180px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-hint)' }} />
          <Tooltip 
            cursor={{ fill: 'var(--surface-raised)', opacity: 0.4 }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', background: 'var(--surface-card)' }}
            itemStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={50}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
