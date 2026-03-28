/**
 * @param {{ icon: string, iconBg: string, label: string, value: string|number, valueColor: string }} props
 */
export function StatCard({ icon, iconBg, label, value, valueColor }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-[16px] bg-white p-4 shadow-sm">
      {/* Icon circle */}
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full text-xl leading-none ${iconBg}`}
        aria-hidden="true"
      >
        {icon}
      </div>

      {/* Value */}
      <span
        className={`text-[22px] font-[800] leading-none tabular-nums ${valueColor}`}
      >
        {value}
      </span>

      {/* Label */}
      <span className="text-[11px] font-semibold leading-tight text-[#6B7280] text-center">
        {label}
      </span>
    </div>
  )
}
