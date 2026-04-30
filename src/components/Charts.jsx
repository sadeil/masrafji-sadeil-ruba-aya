import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { fmtMoney } from '../format.js';
import { useMonthLabel, useT } from '../i18n.jsx';

/* -------------------------------------------------------------------------- */
/* MeasuredChart                                                              */
/* Wraps Recharts charts with explicit width/height from a ResizeObserver.    */
/* Avoids the well-known "width(-1) and height(-1)" warnings under StrictMode.*/
/* -------------------------------------------------------------------------- */

export function MeasuredChart({ height = 240, children, className = '' }) {
  const ref = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight || height;
      if (w > 0 && (w !== size.w || h !== size.h)) setSize({ w, h });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [height, size.w, size.h]);

  return (
    <div ref={ref} style={{ height, width: '100%' }} className={className}>
      {size.w > 0 && size.h > 0 ? children({ width: size.w, height: size.h }) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SparklineSVG                                                               */
/* Tiny self-contained sparkline; no Recharts dependency.                     */
/* -------------------------------------------------------------------------- */

export function Sparkline({ data, color = 'var(--brand-500)', height = 36, fill = true }) {
  if (!Array.isArray(data) || data.length === 0) return <div style={{ height }} />;
  const W = 100;
  const H = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = data.length > 1 ? W / (data.length - 1) : 0;
  const pts = data.map((v, i) => {
    const x = i * stepX;
    const y = H - ((v - min) / range) * H;
    return [x, y];
  });
  const path = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
  const areaPath = `${path} L ${W} ${H} L 0 ${H} Z`;
  const id = `spark-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <div style={{ height, width: '100%' }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" width="100%" height="100%">
        {fill && (
          <>
            <defs>
              <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill={`url(#${id})`} />
          </>
        )}
        <path d={path} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Cashflow chart                                                             */
/* -------------------------------------------------------------------------- */

function CashflowTooltip({ active, payload, label, currency, labelMap = {} }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="chart-tooltip-row">
          <span className="chart-tooltip-dot" style={{ background: p.color }} />
          <span className="text-3">{labelMap[p.dataKey] || p.dataKey}</span>
          <span className="font-semibold ms-auto tabular-nums ltr-numbers">
            {fmtMoney(p.value, currency)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function CashflowChart({ data, currency, height = 260, accent = ['#3961fb', '#10b981'] }) {
  const monthLabel = useMonthLabel();
  const t = useT();

  const localized = useMemo(
    () => data.map((d) => ({ ...d, month: monthLabel(d.month) })),
    [data, monthLabel],
  );
  const labelMap = useMemo(
    () => ({
      income: t('dashboard.income'),
      expenses: t('dashboard.expenses'),
    }),
    [t],
  );

  return (
    <MeasuredChart height={height}>
      {({ width, height: h }) => (
        <AreaChart
          width={width}
          height={h}
          data={localized}
          margin={{ top: 10, right: 8, left: -10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent[1]} stopOpacity="0.32" />
              <stop offset="100%" stopColor={accent[1]} stopOpacity="0" />
            </linearGradient>
            <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent[0]} stopOpacity="0.28" />
              <stop offset="100%" stopColor={accent[0]} stopOpacity="0" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 6" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} dy={6} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={50}
            tickFormatter={(v) => fmtMoney(v, currency, { compact: true }).replace(/[A-Z$₪€]+/g, '').trim()}
          />
          <Tooltip
            content={<CashflowTooltip currency={currency} labelMap={labelMap} />}
            cursor={{ stroke: 'var(--border-strong)', strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="income"
            stroke={accent[1]}
            strokeWidth={2.4}
            fill="url(#incomeFill)"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="expenses"
            stroke={accent[0]}
            strokeWidth={2.4}
            fill="url(#expenseFill)"
            isAnimationActive={false}
          />
        </AreaChart>
      )}
    </MeasuredChart>
  );
}

/* -------------------------------------------------------------------------- */
/* Category donut                                                             */
/* -------------------------------------------------------------------------- */

export function CategoryDonut({ data, currency, total, label }) {
  const t = useT();
  const resolvedLabel = label || t('common.total');
  return (
    <div className="relative">
      <MeasuredChart height={200}>
        {({ width, height }) => (
          <PieChart width={width} height={height}>
            <Pie
              data={data}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={2}
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        )}
      </MeasuredChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="donut-center-label">{resolvedLabel}</div>
        <div className="donut-center-value tabular-nums ltr-numbers">
          {fmtMoney(total, currency)}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Budget bar (horizontal mini)                                               */
/* -------------------------------------------------------------------------- */

export function HBars({ data, currency, max, height = 220 }) {
  return (
    <MeasuredChart height={height}>
      {({ width, height: h }) => (
        <BarChart
          layout="vertical"
          width={width}
          height={h}
          data={data}
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        >
          <XAxis type="number" hide domain={[0, max || 'auto']} />
          <YAxis type="category" dataKey="name" width={80} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ fill: 'var(--surface-2)' }}
            content={({ active, payload }) =>
              active && payload && payload.length ? (
                <div className="chart-tooltip">
                  <div className="chart-tooltip-row">
                    <span className="chart-tooltip-dot" style={{ background: payload[0].payload.color }} />
                    <span className="text-3">{payload[0].payload.name}</span>
                    <span className="font-semibold ml-auto tabular-nums">
                      {fmtMoney(payload[0].value, currency)}
                    </span>
                  </div>
                </div>
              ) : null
            }
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} isAnimationActive={false}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      )}
    </MeasuredChart>
  );
}

/* -------------------------------------------------------------------------- */
/* Forecast chart (with confidence band) — used by the Freelancer dashboard.  */
/* -------------------------------------------------------------------------- */

export function ForecastChart({ data, currency, color = '#f59e0b' }) {
  const monthLabel = useMonthLabel();
  const t = useT();

  const localized = useMemo(
    () => data.map((d) => ({ ...d, month: monthLabel(d.month) })),
    [data, monthLabel],
  );
  const labelMap = useMemo(
    () => ({
      upper: t('sections.freelancer.upper'),
      lower: t('sections.freelancer.lower'),
      forecast: t('sections.freelancer.forecastLine'),
    }),
    [t],
  );

  return (
    <MeasuredChart height={220}>
      {({ width, height }) => (
        <AreaChart
          width={width}
          height={height}
          data={localized}
          margin={{ top: 6, right: 8, left: -10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.32" />
              <stop offset="100%" stopColor={color} stopOpacity="0.04" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 6" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} dy={4} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={50}
            tickFormatter={(v) =>
              fmtMoney(v, currency, { compact: true }).replace(/[A-Z$₪€]+/g, '').trim()
            }
          />
          <Tooltip
            content={<CashflowTooltip currency={currency} labelMap={labelMap} />}
            cursor={{ stroke: 'var(--border-strong)', strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="upper"
            stroke="transparent"
            fill="url(#bandFill)"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="lower"
            stroke="transparent"
            fill="var(--bg)"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="forecast"
            stroke={color}
            strokeWidth={2.6}
            fill="none"
            isAnimationActive={false}
          />
        </AreaChart>
      )}
    </MeasuredChart>
  );
}
