import React from 'react';

export default function StatsCard({ title, count, icon: Icon, color = 'neutral', subtext }) {
  const colorMap = {
    green: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      badge: 'bg-emerald-500 text-white',
      iconBg: 'bg-emerald-100 text-emerald-600',
      text: 'text-emerald-900',
    },
    orange: {
      bg: 'bg-amber-50 text-amber-700 border-amber-100',
      badge: 'bg-amber-500 text-white',
      iconBg: 'bg-amber-100 text-amber-600',
      text: 'text-amber-900',
    },
    red: {
      bg: 'bg-red-50 text-red-700 border-red-100',
      badge: 'bg-red-500 text-white',
      iconBg: 'bg-red-100 text-red-600',
      text: 'text-red-900',
    },
    blue: {
      bg: 'bg-sky-50 text-sky-700 border-sky-100',
      badge: 'bg-sky-500 text-white',
      iconBg: 'bg-sky-100 text-sky-600',
      text: 'text-sky-900',
    },
    neutral: {
      bg: 'bg-slate-50 text-slate-700 border-slate-200',
      badge: 'bg-slate-700 text-white',
      iconBg: 'bg-slate-100 text-slate-600',
      text: 'text-slate-900',
    },
  };

  const style = colorMap[color] || colorMap.neutral;

  return (
    <div className={`p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${style.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className={`text-3xl font-bold tracking-tight ${style.text}`}>
          {count}
        </span>
        {subtext && (
          <span className="text-xs font-medium text-slate-400">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
}
