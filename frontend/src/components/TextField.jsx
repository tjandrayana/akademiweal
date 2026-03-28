import { cn } from '../lib/cn'

export function TextField({
  id,
  name,
  type = 'text',
  label,
  value,
  onChange,
  disabled,
  placeholder,
  autoComplete,
  inputMode,
}) {
  return (
    <div className="flex flex-col gap-2 text-base">
      {label ? (
        <label className="text-[0.8125rem] font-semibold text-muted" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        className={cn(
          'box-border min-h-14 w-full rounded-xl border border-border bg-bg px-4 text-base text-text shadow-sm',
          'placeholder:text-muted',
          'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25',
          'disabled:cursor-not-allowed disabled:opacity-60',
        )}
      />
    </div>
  )
}
