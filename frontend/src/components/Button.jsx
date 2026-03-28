import { cn } from '../lib/cn'

const variantClass = {
  primary:
    'bg-primary text-white shadow-[0_4px_0_#16A34A] hover:brightness-[1.04] active:translate-y-1 active:shadow-none',
  secondary:
    'bg-surface text-text border border-border shadow-sm hover:bg-bg',
  /* Lesson quiz — mobile-first, full-width option rows */
  answer:
    'w-full h-14 justify-start rounded-xl border border-gray-200 bg-white px-4 text-left text-base font-medium text-text shadow-sm transition-all duration-200 hover:bg-gray-50',
  'answer-neutral':
    'w-full h-14 justify-start rounded-xl border border-gray-200 bg-white px-4 text-left text-base font-medium text-muted shadow-sm opacity-80 transition-all duration-200',
  'answer-correct':
    'w-full h-14 justify-start rounded-xl border-2 border-green-500 bg-green-50 px-4 text-left text-base font-medium text-green-800 shadow-sm transition-all duration-200',
  'answer-wrong':
    'w-full h-14 justify-start rounded-xl border-2 border-red-400 bg-red-50 px-4 text-left text-base font-medium text-red-700 shadow-sm transition-all duration-200',
}

const baseClass =
  'inline-flex items-center justify-center min-h-14 rounded-xl px-4 text-base font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

const quizDisabledClass = 'disabled:cursor-default disabled:opacity-100'
const defaultDisabledClass = 'disabled:cursor-not-allowed disabled:opacity-50'

export function Button({ children, type = 'button', variant = 'primary', className = '', ...rest }) {
  const isQuiz =
    variant === 'answer' ||
    variant === 'answer-neutral' ||
    variant === 'answer-correct' ||
    variant === 'answer-wrong'

  return (
    <button
      type={type}
      className={cn(
        baseClass,
        variantClass[variant] ?? variantClass.primary,
        isQuiz ? quizDisabledClass : defaultDisabledClass,
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
