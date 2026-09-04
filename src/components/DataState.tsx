import { AlertCircle, LoaderCircle, SearchX } from 'lucide-react'

type Props = {
  type: 'idle' | 'loading' | 'not-found' | 'error'
  message?: string
  onRetry?: () => void
}

export function DataState({ type, message, onRetry }: Props) {
  const details = {
    idle: ['Look up a product to begin.', 'Enter an EAN-13 barcode or select a documented preset.'],
    loading: ['Looking up the product record…', 'Reading live facts from Open Food Facts.'],
    'not-found': ['No product record found.', 'Open Food Facts does not currently have a record for this barcode.'],
    error: ['The product record is unavailable.', message || 'Try the lookup again in a moment.'],
  }[type]
  const Icon = type === 'loading' ? LoaderCircle : type === 'idle' ? SearchX : AlertCircle

  return (
    <div className={`data-state data-state--${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <Icon size={22} className={type === 'loading' ? 'spin' : undefined} aria-hidden="true" />
      <div>
        <h2>{details[0]}</h2>
        <p>{details[1]}</p>
        {type === 'error' && onRetry ? <button className="text-button" onClick={onRetry}>Try again</button> : null}
      </div>
    </div>
  )
}
