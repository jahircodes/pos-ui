/**
 * Large metric summary card for dashboard KPIs.
 */
interface MetricCardProps {
  label: string;
  value: string | number;
  hint?: string;
}

/** Displays a single KPI with label and prominent value. */
export function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md sm:rounded-xl sm:p-6 sm:shadow-sm">
      <p className="text-base font-medium leading-snug text-gray-600 sm:text-sm sm:text-gray-500">
        {label}
      </p>
      <p className="mt-3 text-[1.75rem] font-bold leading-none tracking-tight text-gray-900 tabular-nums sm:mt-2 sm:text-3xl">
        {value}
      </p>
      {hint ? (
        <p className="mt-2 text-sm leading-relaxed text-gray-500 sm:mt-1 sm:text-xs sm:text-gray-400">{hint}</p>
      ) : null}
    </div>
  );
}
