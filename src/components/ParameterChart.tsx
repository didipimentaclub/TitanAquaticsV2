// @ts-nocheck
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { WaterTest, TankType, PARAMETER_RANGES } from '../types';
import { formatDate } from '../utils/helpers';

interface ParametersDashboardProps {
  tests: WaterTest[];
  tankType: TankType;
}

export const ParametersDashboard: React.FC<ParametersDashboardProps> = ({ tests, tankType }) => {
  const [activeParam, setActiveParam] = useState<keyof WaterTest>('ph');

  // Reverse tests to show oldest to newest on graph
  const data = [...tests].reverse().map(t => ({
    ...t,
    date: formatDate(t.measured_at, 'short')
  }));

  const range = PARAMETER_RANGES[tankType]?.[activeParam as string];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { key: 'temperature', label: 'Temp' },
          { key: 'ph', label: 'pH' },
          { key: 'ammonia', label: 'Amônia' },
          { key: 'nitrate', label: 'Nitrato' },
          { key: 'alkalinity', label: 'KH' },
        ].map(p => (
            <button
              key={p.key}
              onClick={() => setActiveParam(p.key as keyof WaterTest)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${
                activeParam === p.key ? 'bg-[#4fb7b3] text-black' : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {p.label}
            </button>
        ))}
      </div>

      <div className="h-64 w-full bg-[#05051a]/30 rounded-xl border border-white/5 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#64748b" 
              tick={{fill: '#64748b', fontSize: 10}} 
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#64748b" 
              tick={{fill: '#64748b', fontSize: 10}} 
              tickLine={false}
              axisLine={false}
              dx={-10}
              domain={['auto', 'auto']}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1b3b', borderColor: '#ffffff20', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#4fb7b3' }}
            />
            {range && (
                <ReferenceArea y1={range.ideal_min} y2={range.ideal_max} fill="#4fb7b3" fillOpacity={0.05} />
            )}
            <Line 
              type="monotone" 
              dataKey={activeParam} 
              stroke="#4fb7b3" 
              strokeWidth={2} 
              dot={{ fill: '#05051a', stroke: '#4fb7b3', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#4fb7b3' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {range && (
          <div className="flex justify-between text-xs text-slate-500 px-2">
              <span>Mín Ideal: {range.ideal_min} {range.unit}</span>
              <span>Máx Ideal: {range.ideal_max} {range.unit}</span>
          </div>
      )}
    </div>
  );
};